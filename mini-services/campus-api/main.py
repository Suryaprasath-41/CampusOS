import json
import subprocess
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import query, query_one, execute

app = FastAPI(title="CampusOS AI API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    traceback.print_exc()
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=500, content={"error": str(exc)})


# ─── Helpers ────────────────────────────────────────────────────────────

def get_student(student_id: Optional[str] = None) -> dict:
    if student_id:
        student = query_one("SELECT * FROM Student WHERE id = ?", (student_id,))
        if student:
            return student
    student = query_one("SELECT * FROM Student LIMIT 1")
    if not student:
        raise HTTPException(status_code=404, detail="No students found")
    return student


def get_user(user_id: str) -> dict:
    return query_one("SELECT * FROM User WHERE id = ?", (user_id,))


def dt(dt_str):
    """Safely parse datetime string"""
    if not dt_str:
        return None
    if isinstance(dt_str, datetime):
        return dt_str.isoformat()
    return str(dt_str)


# ─── Dashboard API ──────────────────────────────────────────────────────

@app.get("/api/dashboard")
def get_dashboard(studentId: Optional[str] = None):
    student = get_student(studentId)
    user = get_user(student["userId"])

    # Attendance
    att = query_one("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present
        FROM Attendance WHERE studentId = ?
    """, (student["id"],))

    total_att = att["total"] or 0
    present_att = att["present"] or 0
    attendance_pct = round((present_att / total_att * 100), 1) if total_att > 0 else 0

    # Prediction
    remaining_classes = 45
    predicted_pct = round(((present_att + remaining_classes * 0.85) / (total_att + remaining_classes)) * 100, 1)
    risk = "HIGH" if predicted_pct < 75 else "MEDIUM" if predicted_pct < 80 else "LOW"
    safe_leaves = max(0, int((total_att + remaining_classes) * 0.75 - present_att))

    # Assignments
    pending_assignments = query_one("""
        SELECT COUNT(*) as cnt FROM Assignment 
        WHERE dueDate > datetime('now') 
        AND id NOT IN (
            SELECT assignmentId FROM AssignmentSubmission 
            WHERE studentId = ? AND status = 'submitted'
        )
    """, (student["id"],))["cnt"]

    # Events
    upcoming_events = query_one("SELECT COUNT(*) as cnt FROM Event WHERE startDate > datetime('now')")["cnt"]
    registered_events = query_one("SELECT COUNT(*) as cnt FROM EventParticipant WHERE studentId = ?", (student["id"],))["cnt"]

    # Fees
    pending_fees = query_one("SELECT COUNT(*) as cnt FROM Fee WHERE studentId = ? AND paid = 0", (student["id"],))["cnt"]

    # Library
    borrowed = query_one("SELECT COUNT(*) as cnt FROM BookTransaction WHERE studentId = ? AND status = 'borrowed'", (student["id"],))["cnt"]
    overdue = query_one("SELECT COUNT(*) as cnt FROM BookTransaction WHERE studentId = ? AND status = 'borrowed' AND dueDate < datetime('now')", (student["id"],))["cnt"]

    # Placements
    placements = query("SELECT status, COUNT(*) as cnt FROM Placement WHERE studentId = ? GROUP BY status", (student["id"],))
    placement_summary = {p["status"]: p["cnt"] for p in placements}

    # Notifications
    unread = query_one("SELECT COUNT(*) as cnt FROM Notification WHERE userId = ? AND read = 0", (user["id"],))["cnt"]

    # Skills
    skills = json.loads(student["skills"]) if student.get("skills") else []

    # Placement readiness
    readiness = min(100, round(
        student["cgpa"] * 10 * 0.3 +
        min(len(skills) * 8, 30) + 20 + 10
    ))

    # Stress level
    stress = min(100, max(20, 100 - attendance_pct + pending_assignments * 5 - readiness // 3))

    return {
        "student": {
            "id": student["id"],
            "name": user["name"],
            "email": user["email"],
            "rollNumber": student["rollNumber"],
            "department": student["department"],
            "semester": student["semester"],
            "section": student["section"],
            "cgpa": student["cgpa"],
            "hostelRoom": student.get("hostelRoom"),
            "skills": skills,
            "placementStatus": student.get("placementStatus", "seeking"),
        },
        "attendance": {
            "percentage": attendance_pct,
            "totalClasses": total_att,
            "presentClasses": present_att,
            "predicted": predicted_pct,
            "risk": risk,
            "safeLeaves": safe_leaves,
        },
        "assignments": {"pending": pending_assignments},
        "events": {"upcoming": upcoming_events, "registered": registered_events},
        "fees": {"pending": pending_fees},
        "library": {"borrowed": borrowed, "overdue": overdue},
        "placements": placement_summary,
        "notifications": {"unread": unread},
        "readiness": readiness,
        "stressLevel": stress,
    }


# ─── Attendance API ─────────────────────────────────────────────────────

@app.get("/api/attendance")
def get_attendance(studentId: Optional[str] = None):
    student = get_student(studentId)

    # Overall
    att = query_one("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
        FROM Attendance WHERE studentId = ?
    """, (student["id"],))

    total = att["total"] or 0
    present = att["present"] or 0
    absent = att["absent"] or 0
    late = att["late"] or 0
    overall_pct = round((present / total * 100), 1) if total > 0 else 0

    # Subject-wise
    subjects_data = query("""
        SELECT s.id, s.code, s.name,
            COUNT(a.id) as total,
            SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) as present
        FROM SubjectEnrollment se
        JOIN Subject s ON s.id = se.subjectId
        LEFT JOIN Attendance a ON a.subjectId = s.id AND a.studentId = ?
        WHERE se.studentId = ?
        GROUP BY s.id
    """, (student["id"], student["id"]))

    subject_wise = []
    for s in subjects_data:
        s_total = s["total"] or 0
        s_present = s["present"] or 0
        s_pct = round((s_present / s_total * 100), 1) if s_total > 0 else 0
        s_risk = "HIGH" if s_pct < 70 else "MEDIUM" if s_pct < 80 else "LOW"
        subject_wise.append({
            "subjectId": s["id"],
            "code": s["code"],
            "name": s["name"],
            "total": s_total,
            "present": s_present,
            "absent": s_total - s_present,
            "percentage": s_pct,
            "risk": s_risk,
        })

    # Prediction
    remaining = 45
    predicted = round(((present + remaining * 0.85) / (total + remaining)) * 100, 1)
    risk = "HIGH" if predicted < 75 else "MEDIUM" if predicted < 80 else "LOW"
    safe_leaves = max(0, int((total + remaining) * 0.75 - present))
    required_to_attend = max(0, int((total + remaining) * 0.75) - present) if present / total < 0.75 else 0

    # Trend (last 30 days)
    trend_rows = query("""
        SELECT DATE(date) as d, 
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present
        FROM Attendance 
        WHERE studentId = ? AND date >= date('now', '-30 days')
        GROUP BY DATE(date)
        ORDER BY d
    """, (student["id"],))

    trend = []
    for r in trend_rows:
        if r["total"] and r["total"] > 0:
            trend.append({
                "date": r["d"],
                "percentage": round((r["present"] / r["total"] * 100), 1),
                "total": r["total"],
                "present": r["present"],
            })

    # Recent records
    recent_rows = query("""
        SELECT a.date, a.status, s.name as subject_name
        FROM Attendance a
        JOIN Subject s ON s.id = a.subjectId
        WHERE a.studentId = ?
        ORDER BY a.date DESC
        LIMIT 14
    """, (student["id"],))

    recent = [{"date": dt(r["date"]), "subject": r["subject_name"], "status": r["status"]} for r in recent_rows]

    return {
        "overall": {
            "percentage": overall_pct,
            "totalClasses": total,
            "present": present,
            "absent": absent,
            "late": late,
        },
        "subjects": subject_wise,
        "prediction": {
            "current": overall_pct,
            "predicted": predicted,
            "risk": risk,
            "safeLeaves": safe_leaves,
            "requiredToAttend": required_to_attend,
            "remainingClasses": remaining,
        },
        "trend": trend,
        "recent": recent,
    }


# ─── Placement API ──────────────────────────────────────────────────────

@app.get("/api/placement")
def get_placement(studentId: Optional[str] = None):
    student = get_student(studentId)
    skills = json.loads(student.get("skills", "[]")) if student.get("skills") else []

    # Applications
    applications = query("SELECT * FROM Placement WHERE studentId = ?", (student["id"],))
    apps_list = [{
        "id": a["id"],
        "company": a["companyName"],
        "role": a["role"],
        "package": a.get("package"),
        "status": a["status"],
        "interviewDate": dt(a.get("interviewDate")),
    } for a in applications]

    # Readiness
    cgpa_score = min(30, student["cgpa"] * 3.4)
    skills_score = min(30, len(skills) * 3.5)
    projects_score = 18
    communication_score = 15
    total_readiness = round(cgpa_score + skills_score + projects_score + communication_score)

    # Skill gaps
    target_skills = ["System Design", "DSA", "Cloud Computing", "Kubernetes", "CI/CD", "Microservices"]
    current_lower = [s.lower() for s in skills]
    skill_gaps = [s for s in target_skills if s.lower() not in current_lower]

    actions = [
        {"priority": "high", "action": "Learn System Design and DSA patterns", "category": "skills"},
        {"priority": "high", "action": "Build 2-3 portfolio projects on GitHub", "category": "projects"},
        {"priority": "medium", "action": "Practice mock interviews weekly", "category": "interview"},
        {"priority": "medium", "action": "Get AWS/Azure cloud certification", "category": "certification"},
        {"priority": "low", "action": "Contribute to open-source projects", "category": "projects"},
    ]
    if student["cgpa"] < 9.0:
        actions.insert(0, {"priority": "high", "action": "Focus on improving CGPA - aim for 9.0+", "category": "academic"})

    return {
        "readiness": {
            "total": total_readiness,
            "breakdown": {
                "cgpa": round(cgpa_score, 1),
                "skills": round(skills_score, 1),
                "projects": projects_score,
                "communication": communication_score,
            }
        },
        "skills": skills,
        "applications": apps_list,
        "skillGaps": skill_gaps,
        "actions": actions,
        "companies": [
            {"name": "Google", "role": "SDE-1", "match": 85, "skills": ["Python", "DSA", "System Design"]},
            {"name": "Microsoft", "role": "Software Engineer", "match": 78, "skills": ["React", "Azure", "C++"]},
            {"name": "Amazon", "role": "SDE-1", "match": 72, "skills": ["Java", "DSA", "System Design"]},
            {"name": "Flipkart", "role": "Backend Engineer", "match": 80, "skills": ["Node.js", "Java", "System Design"]},
        ],
    }


# ─── Library API ────────────────────────────────────────────────────────

@app.get("/api/library")
def get_library(studentId: Optional[str] = None):
    student = get_student(studentId)

    books = query("SELECT * FROM Book")
    books_list = [{
        "id": b["id"],
        "title": b["title"],
        "author": b["author"],
        "category": b["category"],
        "shelfLocation": b["shelfLocation"],
        "totalCopies": b["totalCopies"],
        "availableCopies": b["availableCopies"],
        "description": b.get("description"),
    } for b in books]

    transactions = query("""
        SELECT bt.*, b.title, b.author FROM BookTransaction bt
        JOIN Book b ON b.id = bt.bookId
        WHERE bt.studentId = ? AND bt.status = 'borrowed'
    """, (student["id"],))

    borrowed = []
    for t in transactions:
        try:
            due = datetime.fromisoformat(t["dueDate"].replace("Z", "+00:00")) if t.get("dueDate") else datetime.now()
            days_until_due = (due - datetime.now(tz=due.tzinfo)).days
        except:
            days_until_due = 0
        fine = max(0, -days_until_due * 5) if days_until_due < 0 else 0
        borrowed.append({
            "id": t["id"],
            "title": t["title"],
            "author": t["author"],
            "borrowDate": dt(t.get("borrowDate")),
            "dueDate": dt(t.get("dueDate")),
            "daysUntilDue": days_until_due,
            "fine": fine,
            "overdue": days_until_due < 0,
        })

    categories = {}
    for b in books:
        categories[b["category"]] = categories.get(b["category"], 0) + 1

    return {
        "books": books_list,
        "borrowed": borrowed,
        "categories": categories,
        "totalBooks": len(books),
        "availableBooks": sum(1 for b in books if b["availableCopies"] > 0),
    }


# ─── Academic API ───────────────────────────────────────────────────────

@app.get("/api/academic")
def get_academic(studentId: Optional[str] = None):
    student = get_student(studentId)

    enrollments = query("""
        SELECT se.*, s.code, s.name, s.credits, s.schedule, s.facultyId
        FROM SubjectEnrollment se
        JOIN Subject s ON s.id = se.subjectId
        WHERE se.studentId = ?
    """, (student["id"],))

    subjects_data = []
    schedule = []
    for e in enrollments:
        # Get faculty name
        faculty = query_one("""
            SELECT f.*, u.name as faculty_name FROM Faculty f
            JOIN User u ON u.id = f.userId
            WHERE f.id = ?
        """, (e["facultyId"],))

        # Get marks
        marks = query_one("""
            SELECT * FROM InternalMark
            WHERE studentId = ? AND subjectId = ?
        """, (student["id"], e["subjectId"]))

        marks_data = None
        if marks:
            marks_data = {
                "test1": marks.get("test1"),
                "test2": marks.get("test2"),
                "assignment1": marks.get("assignment1"),
                "assignment2": marks.get("assignment2"),
                "total": marks.get("total"),
                "maxMarks": marks.get("maxMarks", 50),
            }

        subjects_data.append({
            "code": e["code"],
            "name": e["name"],
            "credits": e["credits"],
            "faculty": faculty["faculty_name"] if faculty else "TBA",
            "marks": marks_data,
        })

        try:
            sched = json.loads(e["schedule"]) if e.get("schedule") else {}
            schedule.append({
                "subject": e["name"],
                "code": e["code"],
                "days": sched.get("days", []),
                "time": sched.get("time", "TBA"),
                "room": sched.get("room", "TBA"),
                "faculty": faculty["faculty_name"] if faculty else "TBA",
            })
        except:
            pass

    # Assignments
    pending_rows = query("""
        SELECT a.*, s.name as subject_name FROM Assignment a
        JOIN Subject s ON s.id = a.subjectId
        WHERE a.dueDate > datetime('now')
        AND a.id NOT IN (
            SELECT assignmentId FROM AssignmentSubmission
            WHERE studentId = ? AND status = 'submitted'
        )
    """, (student["id"],))

    submitted_rows = query("""
        SELECT a.*, s.name as subject_name, sub.status as sub_status FROM Assignment a
        JOIN Subject s ON s.id = a.subjectId
        JOIN AssignmentSubmission sub ON sub.assignmentId = a.id
        WHERE sub.studentId = ? AND sub.status = 'submitted'
    """, (student["id"],))

    pending = [{
        "id": a["id"],
        "title": a["title"],
        "description": a.get("description"),
        "subject": a["subject_name"],
        "dueDate": dt(a.get("dueDate")),
        "maxMarks": a.get("maxMarks", 10),
        "status": "pending",
    } for a in pending_rows]

    submitted = [{
        "id": a["id"],
        "title": a["title"],
        "description": a.get("description"),
        "subject": a["subject_name"],
        "dueDate": dt(a.get("dueDate")),
        "maxMarks": a.get("maxMarks", 10),
        "status": "submitted",
    } for a in submitted_rows]

    return {
        "subjects": subjects_data,
        "schedule": schedule,
        "assignments": {"pending": pending, "submitted": submitted},
        "semester": student["semester"],
    }


# ─── Hostel API ─────────────────────────────────────────────────────────

@app.get("/api/hostel")
def get_hostel(studentId: Optional[str] = None):
    student = get_student(studentId)

    complaints = query("SELECT * FROM Complaint WHERE studentId = ?", (student["id"],))
    leaves = query("SELECT * FROM LeaveRequest WHERE studentId = ?", (student["id"],))

    mess_menu = {
        "Monday": {"breakfast": "Poha + Toast + Tea", "lunch": "Rice + Dal + Sabzi + Salad", "dinner": "Chapati + Paneer + Rice"},
        "Tuesday": {"breakfast": "Idli + Sambar + Tea", "lunch": "Rice + Sambar + Chicken + Salad", "dinner": "Chapati + Dal + Sabzi"},
        "Wednesday": {"breakfast": "Upma + Toast + Tea", "lunch": "Rice + Dal + Fish + Salad", "dinner": "Chapati + Chole + Rice"},
        "Thursday": {"breakfast": "Dosa + Chutney + Tea", "lunch": "Rice + Dal + Paneer + Salad", "dinner": "Chapati + Chicken + Rice"},
        "Friday": {"breakfast": "Bread + Butter + Tea", "lunch": "Biryani + Raita + Salad", "dinner": "Chapati + Dal + Sabzi"},
        "Saturday": {"breakfast": "Paratha + Curd + Tea", "lunch": "Rice + Dal + Egg Curry + Salad", "dinner": "Chapati + Paneer + Rice"},
        "Sunday": {"breakfast": "Chole Bhature + Tea", "lunch": "Special Thali", "dinner": "Chapati + Chicken + Rice + Dessert"},
    }

    return {
        "room": {
            "number": student.get("hostelRoom", "N/A"),
            "block": "H4",
            "type": "Double Sharing",
            "status": "Occupied",
        },
        "complaints": [{
            "id": c["id"],
            "type": c["type"],
            "description": c["description"],
            "status": c["status"],
            "priority": c["priority"],
            "createdAt": dt(c.get("createdAt")),
        } for c in complaints],
        "leaves": [{
            "id": l["id"],
            "type": l["type"],
            "startDate": dt(l.get("startDate")),
            "endDate": dt(l.get("endDate")),
            "reason": l["reason"],
            "status": l["status"],
            "approvedBy": l.get("approvedBy"),
        } for l in leaves],
        "messMenu": mess_menu,
    }


# ─── Finance API ────────────────────────────────────────────────────────

@app.get("/api/finance")
def get_finance(studentId: Optional[str] = None):
    student = get_student(studentId)

    fees = query("SELECT * FROM Fee WHERE studentId = ?", (student["id"],))
    total_paid = sum(f["amount"] for f in fees if f["paid"])
    total_pending = sum(f["amount"] for f in fees if not f["paid"])

    fees_list = []
    upcoming_due = None
    for f in fees:
        fees_list.append({
            "id": f["id"],
            "type": f["type"],
            "amount": f["amount"],
            "paid": bool(f["paid"]),
            "dueDate": dt(f.get("dueDate")),
            "paidDate": dt(f.get("paidDate")),
            "semester": f["semester"],
        })

    return {
        "summary": {
            "totalPaid": total_paid,
            "totalPending": total_pending,
            "totalFees": total_paid + total_pending,
        },
        "fees": fees_list,
        "scholarships": [
            {"name": "Merit Scholarship", "amount": 25000, "status": "eligible", "deadline": "2025-08-15"},
            {"name": "Sports Quota", "amount": 15000, "status": "not_eligible", "deadline": "2025-07-30"},
        ],
    }


# ─── Events API ─────────────────────────────────────────────────────────

@app.get("/api/events")
def get_events(studentId: Optional[str] = None):
    student = get_student(studentId)

    events = query("SELECT * FROM Event WHERE startDate > datetime('now') ORDER BY startDate")
    registered_ids = [p["eventId"] for p in query(
        "SELECT eventId FROM EventParticipant WHERE studentId = ?", (student["id"],)
    )]

    events_list = []
    for e in events:
        p_count = query_one("SELECT COUNT(*) as cnt FROM EventParticipant WHERE eventId = ?", (e["id"],))["cnt"]
        events_list.append({
            "id": e["id"],
            "title": e["title"],
            "description": e.get("description"),
            "type": e["type"],
            "organizer": e.get("organizer"),
            "startDate": dt(e.get("startDate")),
            "endDate": dt(e.get("endDate")),
            "venue": e.get("venue"),
            "registrationOpen": bool(e.get("registrationOpen", 1)),
            "maxParticipants": e.get("maxParticipants"),
            "currentParticipants": p_count,
            "registered": e["id"] in registered_ids,
        })

    return {
        "events": events_list,
        "registered": [e for e in events_list if e["registered"]],
        "categories": list(set(e["type"] for e in events_list)) if events_list else [],
    }


# ─── Admin API ──────────────────────────────────────────────────────────

@app.get("/api/admin")
def get_admin():
    total_students = query_one("SELECT COUNT(*) as cnt FROM Student")["cnt"]
    total_faculty = query_one("SELECT COUNT(*) as cnt FROM Faculty")["cnt"]

    avg_cgpa = query_one("SELECT AVG(cgpa) as avg FROM Student")["avg"] or 0

    att = query_one("""
        SELECT COUNT(*) as total,
            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present
        FROM Attendance
    """)
    avg_attendance = round((att["present"] / att["total"] * 100), 1) if att["total"] else 0

    fees = query_one("SELECT SUM(amount) as total FROM Fee")
    paid = query_one("SELECT SUM(amount) as total FROM Fee WHERE paid = 1")

    total_fees = fees["total"] or 0
    paid_fees = paid["total"] or 0

    depts = query("SELECT department, COUNT(*) as cnt FROM Student GROUP BY department")
    dept_distribution = [{"department": d["department"], "count": d["cnt"]} for d in depts]

    placements = query("SELECT status, COUNT(*) as cnt FROM Placement GROUP BY status")
    placement_stats = {p["status"]: p["cnt"] for p in placements}

    return {
        "stats": {
            "totalStudents": total_students,
            "totalFaculty": total_faculty,
            "avgCGPA": round(avg_cgpa, 2),
            "avgAttendance": avg_attendance,
            "totalFees": total_fees,
            "paidFees": paid_fees,
            "pendingFees": total_fees - paid_fees,
        },
        "departments": dept_distribution,
        "placements": placement_stats,
        "recentActivity": [
            {"type": "enrollment", "message": "New student enrolled in Computer Science", "time": "2 hours ago"},
            {"type": "fee", "message": "Fee payment of ₹75,000 received", "time": "3 hours ago"},
            {"type": "placement", "message": "Google campus drive scheduled", "time": "5 hours ago"},
            {"type": "event", "message": "CodeStorm Hackathon registration opened", "time": "1 day ago"},
            {"type": "complaint", "message": "3 new hostel complaints received", "time": "1 day ago"},
        ],
    }


# ─── Notifications API ──────────────────────────────────────────────────

@app.get("/api/notifications")
def get_notifications(studentId: Optional[str] = None):
    student = get_student(studentId)
    user = get_user(student["userId"])

    notifs = query("""
        SELECT * FROM Notification WHERE userId = ?
        ORDER BY createdAt DESC LIMIT 20
    """, (user["id"],))

    return {
        "notifications": [{
            "id": n["id"],
            "title": n["title"],
            "message": n["message"],
            "type": n["type"],
            "read": bool(n["read"]),
            "actionUrl": n.get("actionUrl"),
            "createdAt": dt(n.get("createdAt")),
        } for n in notifs],
        "unreadCount": sum(1 for n in notifs if not n["read"]),
    }


# ─── AI Chat API ────────────────────────────────────────────────────────

AGENT_PROMPTS = {
    "master": "You are CampusOS AI, the Master Agent of an intelligent campus operating system. You help students with anything related to their college life - attendance, academics, placements, library, hostel, finance, and events. Be concise, helpful, and friendly. Use emojis sparingly. Provide specific data-driven answers when possible. If you don't know something, give general helpful advice.",

    "attendance": "You are the Attendance Intelligence Agent of CampusOS AI. You specialize in attendance analysis, predictions, and advice. Tell students their attendance status, predict future attendance, calculate safe leaves, and suggest strategies to maintain minimum attendance. Always mention risk levels. Be data-driven and specific.",

    "placement": "You are the Placement Agent of CampusOS AI. You help students prepare for placements. Analyze their skills, suggest improvements, recommend companies, create study roadmaps, and provide interview tips. Be motivating but realistic. Focus on actionable advice.",

    "library": "You are the Library AI Agent of CampusOS AI. You help students find books, check availability, recommend reading materials, and manage their library account. Suggest books based on courses and interests. Be knowledgeable about academic resources.",

    "academic": "You are the Academic Planner Agent of CampusOS AI. You help students with schedules, assignments, exam preparation, study plans, and subject-related queries. Be organized and provide structured advice. Help prioritize tasks.",

    "hostel": "You are the Hostel Assistant Agent of CampusOS AI. You help with room issues, mess menu, complaints, leave requests, and any hostel-related queries. Be practical and solution-oriented.",

    "finance": "You are the Finance Agent of CampusOS AI. You help students with fee payments, scholarships, financial planning, and payment reminders. Be clear about amounts and deadlines.",
}


class ChatRequest(BaseModel):
    message: str
    studentId: Optional[str] = None
    agentType: Optional[str] = "master"


def call_llm(system_prompt: str, user_message: str, context: str = "") -> str:
    full_system = system_prompt
    if context:
        full_system += f"\n\nStudent Context:\n{context}"

    try:
        result = subprocess.run(
            ["z-ai", "chat", "--prompt", user_message, "--system", full_system],
            capture_output=True,
            text=True,
            timeout=45,
        )
        if result.returncode == 0 and result.stdout.strip():
            output = result.stdout.strip()
            try:
                data = json.loads(output)
                if isinstance(data, dict) and "choices" in data:
                    return data["choices"][0].get("message", {}).get("content", "I couldn't process that. Please try again.")
                elif isinstance(data, dict) and "content" in data:
                    return data["content"]
            except json.JSONDecodeError:
                pass
            # If it's just plain text
            if len(output) > 10:
                return output
        return "I'm having trouble connecting right now. Please try again."
    except subprocess.TimeoutExpired:
        return "The request timed out. Please try again."
    except Exception as e:
        return f"An error occurred. Please try again."


@app.post("/api/chat")
async def chat(request: ChatRequest):
    message = request.message
    student_id = request.studentId
    agent_type = request.agentType or "master"

    if not message:
        return {"response": "Please ask me something!", "agentType": agent_type}

    try:
        student = get_student(student_id)
        user = get_user(student["userId"])

        # Build context
        att = query_one("""
            SELECT COUNT(*) as total,
                SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present
            FROM Attendance WHERE studentId = ?
        """, (student["id"],))

        total_att = att["total"] or 0
        present_att = att["present"] or 0
        att_pct = round((present_att / total_att * 100), 1) if total_att > 0 else 0

        pending_fees = query_one("SELECT COUNT(*) as cnt FROM Fee WHERE studentId = ? AND paid = 0", (student["id"],))["cnt"]

        context = f"""Name: {user['name']}
Roll Number: {student['rollNumber']}
Department: {student['department']}
Semester: {student['semester']}
CGPA: {student['cgpa']}
Attendance: {att_pct}% ({present_att}/{total_att})
Skills: {student.get('skills', '[]')}
Hostel Room: {student.get('hostelRoom', 'N/A')}
Pending Fees: {pending_fees}
Placement Status: {student.get('placementStatus', 'seeking')}"""

        # Save user message
        execute(
            "INSERT INTO Conversation (id, studentId, role, content, agentType, createdAt) VALUES (lower(hex(randomblob(8))), ?, 'user', ?, ?, datetime('now'))",
            (student["id"], message, agent_type)
        )

        # Get recent history
        recent = query("""
            SELECT role, content FROM Conversation
            WHERE studentId = ?
            ORDER BY createdAt DESC LIMIT 6
        """, (student["id"],))
        recent.reverse()

        history_text = "\n".join([f"{r['role']}: {r['content']}" for r in recent[:-1]]) if len(recent) > 1 else ""

        full_message = message
        if history_text:
            full_message = f"Previous conversation:\n{history_text}\n\nCurrent message: {message}"

        system_prompt = AGENT_PROMPTS.get(agent_type, AGENT_PROMPTS["master"])
        response = call_llm(system_prompt, full_message, context)

        # Save response
        execute(
            "INSERT INTO Conversation (id, studentId, role, content, agentType, createdAt) VALUES (lower(hex(randomblob(8))), ?, 'assistant', ?, ?, datetime('now'))",
            (student["id"], response, agent_type)
        )

        return {"response": response, "agentType": agent_type}
    except Exception as e:
        return {"response": f"I encountered an error. Please try again.", "agentType": agent_type}


# ─── Exams API ──────────────────────────────────────────────────────────

@app.get("/api/exams")
def get_exams():
    student = get_student()

    # Get subjects for current semester
    enrollments = query("""
        SELECT se.subjectId, s.code, s.name, s.semester,
               f.id as facultyId, u.name as facultyName
        FROM SubjectEnrollment se
        JOIN Subject s ON se.subjectId = s.id
        LEFT JOIN Faculty f ON s.facultyId = f.id
        LEFT JOIN User u ON f.userId = u.id
        WHERE se.studentId = ? AND se.semester = ?
    """, (student["id"], student["semester"]))

    # Build upcoming exams
    upcoming_exams = []
    now = datetime.now()
    for i, e in enumerate(enrollments):
        exam_date = now + timedelta(days=7 + i * 4)
        upcoming_exams.append({
            "id": f"exam-{e['subjectId']}",
            "subjectCode": e["code"],
            "subjectName": e["name"],
            "faculty": e["facultyName"] or "TBD",
            "examType": "Mid Semester" if i % 2 == 0 else "End Semester",
            "date": exam_date.isoformat(),
            "time": "10:00 AM",
            "duration": "3 hours",
            "maxMarks": 100,
            "venue": f"Hall-{100 + i}",
            "syllabus": f"Units 1-5 of {e['name']}",
            "preparation": 30 + (i * 17) % 60,
        })

    # Past results from internal marks
    internal_marks = query("""
        SELECT im.*, s.code as subjectCode, s.name as subjectName
        FROM InternalMark im
        JOIN Subject s ON im.subjectId = s.id
        WHERE im.studentId = ?
    """, (student["id"],))

    past_results = []
    for m in internal_marks:
        raw_pct = (m["total"] / m["maxMarks"] * 100) if m.get("maxMarks") and m["maxMarks"] > 0 else 0
        percentage = min(100, round(raw_pct * 10) / 10)
        grade = "A+" if percentage >= 90 else "A" if percentage >= 80 else "B+" if percentage >= 70 else "B" if percentage >= 60 else "C"
        past_results.append({
            "id": m["id"],
            "subjectCode": m["subjectCode"],
            "subjectName": m["subjectName"],
            "semester": m["semester"],
            "test1": m["test1"],
            "test2": m["test2"],
            "assignment1": m["assignment1"],
            "assignment2": m["assignment2"],
            "total": m["total"],
            "maxMarks": m["maxMarks"],
            "percentage": percentage,
            "grade": grade,
        })

    # Semester performance (historical trend + current)
    semester_wise = {}
    for m in internal_marks:
        sem = m["semester"]
        if sem not in semester_wise:
            semester_wise[sem] = {"total": 0, "max": 0, "count": 0}
        semester_wise[sem]["total"] += m.get("total", 0) or 0
        semester_wise[sem]["max"] += m.get("maxMarks", 0) or 0
        semester_wise[sem]["count"] += 1

    current_sem = student["semester"]
    current_avg = 80
    if current_sem in semester_wise and semester_wise[current_sem]["max"] > 0:
        current_avg = min(100, round((semester_wise[current_sem]["total"] / semester_wise[current_sem]["max"]) * 100 * 10) / 10)

    trend_seed = [
        {"sem": 1, "pct": 72, "subs": 6},
        {"sem": 2, "pct": 75, "subs": 6},
        {"sem": 3, "pct": 78, "subs": 6},
        {"sem": 4, "pct": 81, "subs": 6},
        {"sem": 5, "pct": 84, "subs": 6},
    ]
    semester_performance = []
    for t in trend_seed:
        if t["sem"] < current_sem:
            semester_performance.append({"semester": t["sem"], "avgPercentage": t["pct"], "subjects": t["subs"]})
    semester_performance.append({
        "semester": current_sem,
        "avgPercentage": current_avg,
        "subjects": semester_wise.get(current_sem, {}).get("count", 6),
    })
    semester_performance.sort(key=lambda x: x["semester"])

    # Prep recommendations
    recommendations = []
    for exam in upcoming_exams[:3]:
        days_left = max(0, (datetime.fromisoformat(exam["date"]) - now).days)
        recommendations.append({
            "subject": exam["subjectName"],
            "daysLeft": days_left,
            "currentPrep": exam["preparation"],
            "recommended": [
                "Revise unit summaries",
                "Solve previous year papers",
                "Take mock test",
                "Group study for tough topics",
            ],
        })

    best = min(past_results, key=lambda r: -r["percentage"]) if past_results else None
    worst = min(past_results, key=lambda r: r["percentage"]) if past_results else None
    avg_prep = round(sum(e["preparation"] for e in upcoming_exams) / len(upcoming_exams)) if upcoming_exams else 0

    return {
        "upcomingExams": upcoming_exams,
        "pastResults": past_results,
        "semesterPerformance": semester_performance,
        "recommendations": recommendations,
        "summary": {
            "totalUpcoming": len(upcoming_exams),
            "avgPreparation": avg_prep,
            "bestSubject": best,
            "weakestSubject": worst,
        },
    }


# ─── Profile API ────────────────────────────────────────────────────────

@app.get("/api/profile")
def get_profile():
    student = get_student()
    user = get_user(student["userId"])
    skills = json.loads(student.get("skills") or "[]")

    # Attendance stats
    att = query_one("""
        SELECT COUNT(*) as total,
            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present
        FROM Attendance WHERE studentId = ?
    """, (student["id"],))
    total_att = att["total"] or 0
    present_att = att["present"] or 0
    att_pct = round((present_att / total_att * 1000) / 10, 1) if total_att > 0 else 0

    # Placements
    placements = query("SELECT * FROM Placement WHERE studentId = ?", (student["id"],))
    events_attended = query_one("SELECT COUNT(*) as cnt FROM EventParticipant WHERE studentId = ?", (student["id"],))["cnt"]

    # Internal marks average
    internal_marks = query("SELECT * FROM InternalMark WHERE studentId = ?", (student["id"],))
    avg_internal = round(sum(m.get("total", 0) or 0 for m in internal_marks) / len(internal_marks), 1) if internal_marks else 0

    # Achievements
    achievements = [
        {"id": "a1", "title": "Academic Excellence", "desc": "CGPA above 8.5", "icon": "graduation", "unlocked": student["cgpa"] >= 8.5, "color": "purple"},
        {"id": "a2", "title": "Perfect Attendance", "desc": "90%+ attendance", "icon": "check", "unlocked": att_pct >= 90, "color": "cyan"},
        {"id": "a3", "title": "Placement Ready", "desc": "85%+ readiness", "icon": "trophy", "unlocked": student["cgpa"] * 10 >= 85, "color": "green"},
        {"id": "a4", "title": "Skill Master", "desc": "5+ skills listed", "icon": "sparkles", "unlocked": len(skills) >= 5, "color": "yellow"},
        {"id": "a5", "title": "Event Enthusiast", "desc": "Attended 3+ events", "icon": "calendar", "unlocked": events_attended >= 3, "color": "blue"},
        {"id": "a6", "title": "Bookworm", "desc": "Active library member", "icon": "book", "unlocked": True, "color": "orange"},
        {"id": "a7", "title": "Top Performer", "desc": "80%+ in internals", "icon": "star", "unlocked": avg_internal >= 40, "color": "rose"},
        {"id": "a8", "title": "Career Driven", "desc": "Applied to 3+ companies", "icon": "target", "unlocked": len(placements) >= 3, "color": "violet"},
    ]

    # Activity timeline
    timeline = []
    recent_convs = query("""
        SELECT * FROM Conversation WHERE studentId = ? AND role = 'user'
        ORDER BY createdAt DESC LIMIT 3
    """, (student["id"],))
    for c in recent_convs:
        content = c["content"] or ""
        timeline.append({
            "date": dt(c["createdAt"]),
            "type": "ai",
            "title": f"Asked {c.get('agentType') or 'AI'}: \"{content[:50]}{'...' if len(content) > 50 else ''}\"",
            "icon": "bot",
        })

    for p in placements:
        timeline.append({
            "date": dt(p["createdAt"]),
            "type": "placement",
            "title": f"Applied to {p['companyName']} for {p['role']}",
            "icon": "target",
        })

    recent_fees = query("""
        SELECT * FROM Fee WHERE studentId = ? AND paid = 1
        ORDER BY paidDate DESC LIMIT 2
    """, (student["id"],))
    for f in recent_fees:
        if f.get("paidDate"):
            timeline.append({
                "date": dt(f["paidDate"]),
                "type": "finance",
                "title": f"Paid {f['type']} fee ₹{f['amount']}",
                "icon": "wallet",
            })

    timeline.sort(key=lambda x: x["date"] or "", reverse=True)

    # Stats
    conv_count = query_one("SELECT COUNT(*) as cnt FROM Conversation WHERE studentId = ?", (student["id"],))["cnt"]

    return {
        "student": {
            "id": student["id"],
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "department": user.get("department"),
            "avatar": user.get("avatar"),
            "rollNumber": student["rollNumber"],
            "semester": student["semester"],
            "section": student["section"],
            "cgpa": student["cgpa"],
            "hostelRoom": student.get("hostelRoom"),
            "guardianName": student.get("guardianName"),
            "guardianPhone": student.get("guardianPhone"),
            "skills": skills,
            "placementStatus": student.get("placementStatus"),
            "createdAt": dt(student.get("createdAt")),
        },
        "achievements": achievements,
        "timeline": timeline[:10],
        "stats": {
            "totalClasses": total_att,
            "attendancePct": att_pct,
            "eventsAttended": events_attended,
            "companiesApplied": len(placements),
            "avgInternal": avg_internal,
            "conversationsHad": conv_count,
        },
    }


class ProfileUpdate(BaseModel):
    skills: Optional[list] = None
    phone: Optional[str] = None
    placementStatus: Optional[str] = None

@app.patch("/api/profile")
def update_profile(body: ProfileUpdate):
    student = get_student()
    if body.skills is not None:
        execute("UPDATE Student SET skills = ? WHERE id = ?", (json.dumps(body.skills), student["id"]))
    if body.placementStatus is not None:
        execute("UPDATE Student SET placementStatus = ? WHERE id = ?", (body.placementStatus, student["id"]))
    if body.phone is not None:
        execute("UPDATE User SET phone = ? WHERE id = ?", (body.phone, student["userId"]))
    return {"success": True}


# ─── Notifications PATCH ────────────────────────────────────────────────

class NotifUpdate(BaseModel):
    id: Optional[str] = None
    markAllRead: Optional[bool] = None

@app.patch("/api/notifications")
def update_notifications(body: NotifUpdate):
    student = get_student()
    user = get_user(student["userId"])

    if body.markAllRead:
        execute("UPDATE Notification SET read = 1 WHERE userId = ? AND read = 0", (user["id"],))
        return {"success": True, "updated": "all"}

    if body.id:
        execute("UPDATE Notification SET read = 1 WHERE id = ?", (body.id,))
        return {"success": True, "updated": body.id}

    raise HTTPException(status_code=400, detail="No action specified")


# ─── AI Memory API ──────────────────────────────────────────────────────

@app.get("/api/ai-memory")
def get_ai_memory():
    student = get_student()

    memories = query("""
        SELECT * FROM AiMemory WHERE studentId = ?
        ORDER BY createdAt DESC LIMIT 50
    """, (student["id"],))

    conv_count = query_one("SELECT COUNT(*) as cnt FROM Conversation WHERE studentId = ?", (student["id"],))["cnt"]

    recent_convs = query("""
        SELECT * FROM Conversation WHERE studentId = ?
        ORDER BY createdAt DESC LIMIT 5
    """, (student["id"],))

    memories_by_category = {}
    for m in memories:
        cat = m["category"]
        memories_by_category[cat] = memories_by_category.get(cat, 0) + 1

    return {
        "memories": [{
            "id": m["id"],
            "category": m["category"],
            "content": m["content"],
            "createdAt": dt(m["createdAt"]),
        } for m in memories],
        "memoriesByCategory": memories_by_category,
        "totalMemories": len(memories),
        "totalConversations": conv_count,
        "recentConversations": [{
            "id": c["id"],
            "role": c["role"],
            "agentType": c.get("agentType"),
            "content": (c["content"] or "")[:120] + ("..." if len(c["content"] or "") > 120 else ""),
            "createdAt": dt(c["createdAt"]),
        } for c in recent_convs],
    }


@app.delete("/api/ai-memory")
def delete_ai_memory(id: Optional[str] = Query(None)):
    if id:
        execute("DELETE FROM AiMemory WHERE id = ?", (id,))
        return {"success": True, "deleted": id}

    student = get_student()
    execute("DELETE FROM AiMemory WHERE studentId = ?", (student["id"],))
    return {"success": True, "deleted": "all"}


# ─── Health ─────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "CampusOS AI Python Backend is Operational", "version": "2.0"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
