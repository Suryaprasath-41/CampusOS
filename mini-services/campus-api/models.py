from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
    role = Column(String, default="student")
    avatar = Column(String, nullable=True)
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Student(Base):
    __tablename__ = "Student"
    id = Column(String, primary_key=True)
    userId = Column("userId", String, ForeignKey("User.id"))
    rollNumber = Column("rollNumber", String, unique=True)
    department = Column(String)
    semester = Column(Integer, default=1)
    section = Column(String, default="A")
    cgpa = Column(Float, default=0)
    hostelRoom = Column("hostelRoom", String, nullable=True)
    guardianName = Column("guardianName", String, nullable=True)
    guardianPhone = Column("guardianPhone", String, nullable=True)
    skills = Column(String, nullable=True)
    placementStatus = Column("placementStatus", String, default="seeking")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Faculty(Base):
    __tablename__ = "Faculty"
    id = Column(String, primary_key=True)
    userId = Column("userId", String, ForeignKey("User.id"))
    department = Column(String)
    designation = Column(String, default="Assistant Professor")
    cabinLocation = Column("cabinLocation", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Subject(Base):
    __tablename__ = "Subject"
    id = Column(String, primary_key=True)
    code = Column(String, unique=True)
    name = Column(String)
    department = Column(String)
    semester = Column(Integer)
    credits = Column(Integer, default=3)
    facultyId = Column("facultyId", String, ForeignKey("Faculty.id"))
    schedule = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SubjectEnrollment(Base):
    __tablename__ = "SubjectEnrollment"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    subjectId = Column("subjectId", String, ForeignKey("Subject.id"))
    semester = Column(Integer)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)


class Attendance(Base):
    __tablename__ = "Attendance"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    subjectId = Column("subjectId", String, ForeignKey("Subject.id"))
    date = Column(DateTime)
    status = Column(String, default="present")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)


class InternalMark(Base):
    __tablename__ = "InternalMark"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    subjectId = Column("subjectId", String, ForeignKey("Subject.id"))
    test1 = Column(Float, nullable=True)
    test2 = Column(Float, nullable=True)
    assignment1 = Column(Float, nullable=True)
    assignment2 = Column(Float, nullable=True)
    total = Column(Float, nullable=True)
    maxMarks = Column("maxMarks", Float, default=50)
    semester = Column(Integer)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Assignment(Base):
    __tablename__ = "Assignment"
    id = Column(String, primary_key=True)
    subjectId = Column("subjectId", String, ForeignKey("Subject.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    dueDate = Column("dueDate", DateTime)
    maxMarks = Column("maxMarks", Float, default=10)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AssignmentSubmission(Base):
    __tablename__ = "AssignmentSubmission"
    id = Column(String, primary_key=True)
    assignmentId = Column("assignmentId", String, ForeignKey("Assignment.id"))
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    submittedAt = Column("submittedAt", DateTime, nullable=True)
    marks = Column(Float, nullable=True)
    feedback = Column(String, nullable=True)
    status = Column(String, default="pending")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Book(Base):
    __tablename__ = "Book"
    id = Column(String, primary_key=True)
    title = Column(String)
    author = Column(String)
    isbn = Column(String, nullable=True)
    category = Column(String)
    shelfLocation = Column("shelfLocation", String)
    totalCopies = Column("totalCopies", Integer, default=1)
    availableCopies = Column("availableCopies", Integer, default=1)
    description = Column(String, nullable=True)
    coverUrl = Column("coverUrl", String, nullable=True)
    digitalUrl = Column("digitalUrl", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BookTransaction(Base):
    __tablename__ = "BookTransaction"
    id = Column(String, primary_key=True)
    bookId = Column("bookId", String, ForeignKey("Book.id"))
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    borrowDate = Column("borrowDate", DateTime)
    dueDate = Column("dueDate", DateTime)
    returnDate = Column("returnDate", DateTime, nullable=True)
    fine = Column(Float, default=0)
    status = Column(String, default="borrowed")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Placement(Base):
    __tablename__ = "Placement"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    companyName = Column("companyName", String)
    role = Column(String)
    package = Column(Float, nullable=True)
    status = Column(String, default="applied")
    interviewDate = Column("interviewDate", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Event(Base):
    __tablename__ = "Event"
    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(String, nullable=True)
    type = Column(String)
    organizer = Column(String, nullable=True)
    startDate = Column("startDate", DateTime)
    endDate = Column("endDate", DateTime, nullable=True)
    venue = Column(String, nullable=True)
    registrationOpen = Column("registrationOpen", Boolean, default=True)
    maxParticipants = Column("maxParticipants", Integer, nullable=True)
    imageUrl = Column("imageUrl", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class EventParticipant(Base):
    __tablename__ = "EventParticipant"
    id = Column(String, primary_key=True)
    eventId = Column("eventId", String, ForeignKey("Event.id"))
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    registeredAt = Column("registeredAt", DateTime, default=datetime.utcnow)
    attended = Column(Boolean, default=False)
    certificateUrl = Column("certificateUrl", String, nullable=True)


class Complaint(Base):
    __tablename__ = "Complaint"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    type = Column(String)
    description = Column(String)
    status = Column(String, default="open")
    priority = Column(String, default="medium")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LeaveRequest(Base):
    __tablename__ = "LeaveRequest"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    type = Column(String)
    startDate = Column("startDate", DateTime)
    endDate = Column("endDate", DateTime)
    reason = Column(String)
    status = Column(String, default="pending")
    approvedBy = Column("approvedBy", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Fee(Base):
    __tablename__ = "Fee"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    type = Column(String)
    amount = Column(Float)
    paid = Column(Boolean, default=False)
    dueDate = Column("dueDate", DateTime)
    paidDate = Column("paidDate", DateTime, nullable=True)
    semester = Column(Integer)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AiMemory(Base):
    __tablename__ = "AiMemory"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    category = Column(String)
    content = Column(String)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "Conversation"
    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("Student.id"))
    role = Column(String)
    content = Column(String)
    agentType = Column("agentType", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "Notification"
    id = Column(String, primary_key=True)
    userId = Column("userId", String, ForeignKey("User.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String, default="info")
    read = Column(Boolean, default=False)
    actionUrl = Column("actionUrl", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
