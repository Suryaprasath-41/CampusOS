import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting admin seed data...');

  // ─── Check if already seeded ─────────────────────────────────────
  const existingStudents = await prisma.student.count();
  if (existingStudents > 5) {
    console.log('⏭️  Admin seed data already exists (found', existingStudents, 'students). Skipping.');
    return;
  }

  // ─── Get existing faculties ──────────────────────────────────────
  const existingFaculties = await prisma.faculty.findMany();
  console.log(`📋 Found ${existingFaculties.length} existing faculties`);

  // ─── Create Additional Faculty ───────────────────────────────────
  console.log('👨‍🏫 Creating additional faculty...');

  const newFacultyData = [
    { email: 'dr.reddy@campus.edu', name: 'Dr. Suresh Reddy', department: 'Information Technology', designation: 'Associate Professor', cabin: 'Block B-201' },
    { email: 'dr.nair@campus.edu', name: 'Dr. Lakshmi Nair', department: 'Electronics & Communication', designation: 'Professor', cabin: 'Block C-102' },
    { email: 'dr.joshi@campus.edu', name: 'Dr. Ramesh Joshi', department: 'Electrical Engineering', designation: 'Associate Professor', cabin: 'Block D-205' },
    { email: 'dr.rao@campus.edu', name: 'Dr. Kiran Rao', department: 'Mechanical Engineering', designation: 'Professor', cabin: 'Block E-301' },
    { email: 'dr.banerjee@campus.edu', name: 'Dr. Ananya Banerjee', department: 'Civil Engineering', designation: 'Assistant Professor', cabin: 'Block F-108' },
    { email: 'dr.iyer@campus.edu', name: 'Dr. Venkat Iyer', department: 'Information Technology', designation: 'Assistant Professor', cabin: 'Block B-305' },
    { email: 'dr.das@campus.edu', name: 'Dr. Meera Das', department: 'Electronics & Communication', designation: 'Assistant Professor', cabin: 'Block C-210' },
  ];

  const newFaculties = [];
  for (const fd of newFacultyData) {
    const user = await prisma.user.upsert({
      where: { email: fd.email },
      update: {},
      create: { email: fd.email, name: fd.name, role: 'faculty', department: fd.department, avatar: '' },
    });
    const faculty = await prisma.faculty.create({
      data: { userId: user.id, department: fd.department, designation: fd.designation, cabinLocation: fd.cabin },
    });
    newFaculties.push(faculty);
    console.log(`  ✅ Faculty: ${fd.name} (${fd.department})`);
  }

  const allFaculties = [...existingFaculties, ...newFaculties];

  // ─── Create Additional Subjects ──────────────────────────────────
  console.log('📚 Creating additional subjects...');

  const newSubjectData = [
    { code: 'IT501', name: 'Web Technologies', department: 'Information Technology', semester: 5, credits: 4, facultyIdx: 0, days: ['Monday', 'Wednesday', 'Friday'], time: '10:00 AM - 11:00 AM', room: 'LH-203' },
    { code: 'IT502', name: 'Data Warehousing & Mining', department: 'Information Technology', semester: 5, credits: 3, facultyIdx: 5, days: ['Tuesday', 'Thursday'], time: '11:00 AM - 12:30 PM', room: 'LH-307' },
    { code: 'EC401', name: 'Digital Signal Processing', department: 'Electronics & Communication', semester: 4, credits: 4, facultyIdx: 1, days: ['Monday', 'Wednesday', 'Friday'], time: '9:00 AM - 10:00 AM', room: 'LH-104' },
    { code: 'EC402', name: 'VLSI Design', department: 'Electronics & Communication', semester: 4, credits: 3, facultyIdx: 6, days: ['Tuesday', 'Thursday'], time: '2:00 PM - 3:30 PM', room: 'LH-402' },
    { code: 'EE301', name: 'Power Systems', department: 'Electrical Engineering', semester: 3, credits: 4, facultyIdx: 2, days: ['Monday', 'Wednesday'], time: '11:00 AM - 12:30 PM', room: 'LH-201' },
    { code: 'EE302', name: 'Control Systems', department: 'Electrical Engineering', semester: 3, credits: 3, facultyIdx: 2, days: ['Friday'], time: '2:00 PM - 5:00 PM', room: 'Lab-201' },
    { code: 'ME601', name: 'Thermodynamics', department: 'Mechanical Engineering', semester: 6, credits: 4, facultyIdx: 3, days: ['Monday', 'Wednesday', 'Friday'], time: '10:00 AM - 11:00 AM', room: 'LH-302' },
    { code: 'ME602', name: 'Fluid Mechanics', department: 'Mechanical Engineering', semester: 6, credits: 3, facultyIdx: 3, days: ['Tuesday', 'Thursday'], time: '9:00 AM - 10:30 AM', room: 'LH-105' },
    { code: 'CE501', name: 'Structural Analysis', department: 'Civil Engineering', semester: 5, credits: 4, facultyIdx: 4, days: ['Monday', 'Wednesday'], time: '2:00 PM - 3:30 PM', room: 'LH-401' },
    { code: 'CE502', name: 'Geotechnical Engineering', department: 'Civil Engineering', semester: 5, credits: 3, facultyIdx: 4, days: ['Friday'], time: '10:00 AM - 1:00 PM', room: 'Lab-102' },
    { code: 'IT601', name: 'Cloud Computing', department: 'Information Technology', semester: 6, credits: 3, facultyIdx: 0, days: ['Tuesday', 'Thursday'], time: '2:00 PM - 3:30 PM', room: 'LH-204' },
    { code: 'EC601', name: 'Embedded Systems', department: 'Electronics & Communication', semester: 6, credits: 4, facultyIdx: 1, days: ['Monday', 'Wednesday'], time: '10:00 AM - 11:30 AM', room: 'LH-303' },
  ];

  const newSubjects = [];
  for (const sd of newSubjectData) {
    const subject = await prisma.subject.upsert({
      where: { code: sd.code },
      update: {},
      create: {
        code: sd.code,
        name: sd.name,
        department: sd.department,
        semester: sd.semester,
        credits: sd.credits,
        facultyId: newFaculties[sd.facultyIdx].id,
        schedule: JSON.stringify({ days: sd.days, time: sd.time, room: sd.room }),
      },
    });
    newSubjects.push(subject);
    console.log(`  ✅ Subject: ${sd.code} - ${sd.name}`);
  }

  // Also get existing subjects
  const existingSubjects = await prisma.subject.findMany();
  const allSubjects = [...existingSubjects, ...newSubjects];

  // ─── Create Additional Students (20+) ────────────────────────────
  console.log('🎓 Creating additional students...');

  const studentData = [
    // CS Department
    { email: 'priya.menon@campus.edu', name: 'Priya Menon', roll: 'CS2022015', dept: 'Computer Science', sem: 6, section: 'A', cgpa: 9.2, hostel: 'H2-101', guardian: 'Suresh Menon', guardianPhone: '+91 98111 22334', skills: ['Python', 'Java', 'React', 'AWS'], placement: 'placed' },
    { email: 'arjun.krishnan@campus.edu', name: 'Arjun Krishnan', roll: 'CS2022023', dept: 'Computer Science', sem: 6, section: 'A', cgpa: 8.5, hostel: 'H3-205', guardian: 'Krishnan R', guardianPhone: '+91 98222 33445', skills: ['C++', 'ML', 'TensorFlow', 'Docker'], placement: 'interview' },
    { email: 'neha.gupta@campus.edu', name: 'Neha Gupta', roll: 'CS2022037', dept: 'Computer Science', sem: 6, section: 'B', cgpa: 7.8, hostel: null, guardian: 'Rajesh Gupta', guardianPhone: '+91 98333 44556', skills: ['JavaScript', 'Node.js', 'MongoDB'], placement: 'seeking' },
    { email: 'rahul.verma@campus.edu', name: 'Rahul Verma', roll: 'CS2022042', dept: 'Computer Science', sem: 6, section: 'B', cgpa: 6.9, hostel: 'H4-310', guardian: 'Amit Verma', guardianPhone: '+91 98444 55667', skills: ['Java', 'Spring Boot', 'SQL'], placement: 'seeking' },

    // IT Department
    { email: 'ananya.singh@campus.edu', name: 'Ananya Singh', roll: 'IT2022010', dept: 'Information Technology', sem: 5, section: 'A', cgpa: 8.9, hostel: 'H1-203', guardian: 'Manoj Singh', guardianPhone: '+91 98555 66778', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], placement: 'placed' },
    { email: 'vikram.mehta@campus.edu', name: 'Vikram Mehta', roll: 'IT2022022', dept: 'Information Technology', sem: 5, section: 'A', cgpa: 7.5, hostel: 'H3-112', guardian: 'Deepak Mehta', guardianPhone: '+91 98666 77889', skills: ['Python', 'Django', 'PostgreSQL'], placement: 'interview' },
    { email: 'sneha.pillai@campus.edu', name: 'Sneha Pillai', roll: 'IT2022035', dept: 'Information Technology', sem: 5, section: 'B', cgpa: 9.5, hostel: 'H2-305', guardian: 'Pillai Kumar', guardianPhone: '+91 98777 88990', skills: ['ML', 'Python', 'Kubernetes', 'AWS', 'GCP'], placement: 'placed' },
    { email: 'rohan.das@campus.edu', name: 'Rohan Das', roll: 'IT2022041', dept: 'Information Technology', sem: 5, section: 'B', cgpa: 6.2, hostel: null, guardian: 'Arun Das', guardianPhone: '+91 98888 99001', skills: ['HTML', 'CSS', 'JavaScript'], placement: 'seeking' },

    // ECE Department
    { email: 'divya.sharma@campus.edu', name: 'Divya Sharma', roll: 'EC2022008', dept: 'Electronics & Communication', sem: 4, section: 'A', cgpa: 8.1, hostel: 'H1-405', guardian: 'Sharma VK', guardianPhone: '+91 98999 00112', skills: ['Verilog', 'MATLAB', 'Signal Processing'], placement: 'seeking' },
    { email: 'karan.patel@campus.edu', name: 'Karan Patel', roll: 'EC2022019', dept: 'Electronics & Communication', sem: 4, section: 'A', cgpa: 7.3, hostel: 'H4-108', guardian: 'Patel Rajesh', guardianPhone: '+91 98000 11223', skills: ['VLSI', 'Embedded C', 'IoT'], placement: 'seeking' },
    { email: 'meera.nair@campus.edu', name: 'Meera Nair', roll: 'EC2022033', dept: 'Electronics & Communication', sem: 4, section: 'B', cgpa: 9.0, hostel: 'H2-210', guardian: 'Nair Suresh', guardianPhone: '+91 98111 22334', skills: ['DSP', 'Python', 'FPGA', 'PCB Design'], placement: 'interview' },
    { email: 'aditya.reddy@campus.edu', name: 'Aditya Reddy', roll: 'EC2022045', dept: 'Electronics & Communication', sem: 4, section: 'B', cgpa: 5.8, hostel: null, guardian: 'Reddy Kumar', guardianPhone: '+91 98222 33445', skills: ['C', 'Basic Electronics'], placement: 'seeking' },

    // EEE Department
    { email: 'suresh.kumar@campus.edu', name: 'Suresh Kumar', roll: 'EE2022005', dept: 'Electrical Engineering', sem: 3, section: 'A', cgpa: 7.6, hostel: 'H3-315', guardian: 'Kumar Raja', guardianPhone: '+91 98333 44556', skills: ['Power Systems', 'MATLAB', 'PLC'], placement: 'seeking' },
    { email: 'pooja.agarwal@campus.edu', name: 'Pooja Agarwal', roll: 'EE2022017', dept: 'Electrical Engineering', sem: 3, section: 'A', cgpa: 8.4, hostel: 'H1-108', guardian: 'Agarwal Sunil', guardianPhone: '+91 98444 55667', skills: ['Control Systems', 'Simulink', 'Renewable Energy'], placement: 'seeking' },
    { email: 'deepak.rao@campus.edu', name: 'Deepak Rao', roll: 'EE2022029', dept: 'Electrical Engineering', sem: 3, section: 'B', cgpa: 6.5, hostel: null, guardian: 'Rao Venkat', guardianPhone: '+91 98555 66778', skills: ['Electrical Machines', 'AutoCAD'], placement: 'seeking' },

    // ME Department
    { email: 'amit.singh@campus.edu', name: 'Amit Singh', roll: 'ME2022012', dept: 'Mechanical Engineering', sem: 6, section: 'A', cgpa: 7.9, hostel: 'H4-215', guardian: 'Singh Harjeet', guardianPhone: '+91 98666 77889', skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'CNC'], placement: 'interview' },
    { email: 'ritu.yadav@campus.edu', name: 'Ritu Yadav', roll: 'ME2022024', dept: 'Mechanical Engineering', sem: 6, section: 'A', cgpa: 8.7, hostel: 'H2-410', guardian: 'Yadav Mohan', guardianPhone: '+91 98777 88990', skills: ['Thermodynamics', 'CATIA', '3D Printing', 'MATLAB'], placement: 'placed' },
    { email: 'manish.tiwari@campus.edu', name: 'Manish Tiwari', roll: 'ME2022038', dept: 'Mechanical Engineering', sem: 6, section: 'B', cgpa: 5.9, hostel: null, guardian: 'Tiwari Ram', guardianPhone: '+91 98888 99001', skills: ['Basic Mechanics', 'Welding'], placement: 'seeking' },

    // CE Department
    { email: 'sunita.kumari@campus.edu', name: 'Sunita Kumari', roll: 'CE2022007', dept: 'Civil Engineering', sem: 5, section: 'A', cgpa: 8.2, hostel: 'H1-310', guardian: 'Kumari Raj', guardianPhone: '+91 98999 00112', skills: ['AutoCAD', 'STAAD Pro', 'Project Management'], placement: 'seeking' },
    { email: 'rajesh.mishra@campus.edu', name: 'Rajesh Mishra', roll: 'CE2022021', dept: 'Civil Engineering', sem: 5, section: 'A', cgpa: 7.1, hostel: 'H3-408', guardian: 'Mishra Lal', guardianPhone: '+91 98000 11223', skills: ['Surveying', 'Revit', 'Concrete Tech'], placement: 'seeking' },
    { email: 'anita.choudhary@campus.edu', name: 'Anita Choudhary', roll: 'CE2022036', dept: 'Civil Engineering', sem: 5, section: 'B', cgpa: 9.4, hostel: 'H2-120', guardian: 'Choudhary PK', guardianPhone: '+91 98111 22334', skills: ['Structural Design', 'BIM', 'Python', 'GIS'], placement: 'placed' },
    { email: 'prakash.jha@campus.edu', name: 'Prakash Jha', roll: 'CE2022048', dept: 'Civil Engineering', sem: 5, section: 'B', cgpa: 6.8, hostel: null, guardian: 'Jha Suresh', guardianPhone: '+91 98222 33445', skills: ['AutoCAD', 'Estimation'], placement: 'seeking' },
  ];

  const createdStudents = [];
  for (const sd of studentData) {
    const user = await prisma.user.upsert({
      where: { email: sd.email },
      update: {},
      create: {
        email: sd.email,
        name: sd.name,
        role: 'student',
        department: sd.dept,
        phone: sd.guardianPhone,
        avatar: '',
      },
    });

    const student = await prisma.student.upsert({
      where: { rollNumber: sd.roll },
      update: {},
      create: {
        userId: user.id,
        rollNumber: sd.roll,
        department: sd.dept,
        semester: sd.sem,
        section: sd.section,
        cgpa: sd.cgpa,
        hostelRoom: sd.hostel,
        guardianName: sd.guardian,
        guardianPhone: sd.guardianPhone,
        skills: JSON.stringify(sd.skills),
        placementStatus: sd.placement,
      },
    });
    createdStudents.push({ ...student, _skills: sd.skills, _placement: sd.placement });
    console.log(`  ✅ Student: ${sd.name} (${sd.roll}) - CGPA: ${sd.cgpa} - ${sd.placement}`);
  }

  // ─── Enroll Students in Subjects ─────────────────────────────────
  console.log('📖 Enrolling students in subjects...');

  for (const student of createdStudents) {
    // Find subjects matching the student's department and semester
    const matchingSubjects = allSubjects.filter(
      s => s.department === student.department && s.semester === student.semester
    );

    // Also add some cross-department math subjects if applicable
    const mathSubjects = allSubjects.filter(
      s => s.department === 'Mathematics' && s.semester === student.semester
    );

    const subjectsToEnroll = [...matchingSubjects, ...mathSubjects];

    for (const subject of subjectsToEnroll) {
      try {
        await prisma.subjectEnrollment.upsert({
          where: {
            studentId_subjectId: { studentId: student.id, subjectId: subject.id },
          },
          update: {},
          create: {
            studentId: student.id,
            subjectId: subject.id,
            semester: student.semester,
          },
        });
      } catch (e) {
        // Skip if already enrolled
      }
    }
  }
  console.log(`  ✅ Enrolled students in subjects`);

  // ─── Create Attendance Records ───────────────────────────────────
  console.log('📋 Creating attendance records...');

  const attendanceStatuses = ['present', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'late'];
  let attendanceCount = 0;

  for (const student of createdStudents) {
    // Create attendance for last 30 days (subset of students to keep it manageable)
    if (Math.random() > 0.6) continue; // Only ~60% of students get attendance records

    const studentSubjects = allSubjects.filter(
      s => s.department === student.department && s.semester === student.semester
    );

    if (studentSubjects.length === 0) continue;

    const records: any[] = [];
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const subject of studentSubjects.slice(0, 3)) { // Limit to 3 subjects per student
        const schedule = JSON.parse(subject.schedule || '{}');
        const days = schedule.days || [];
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        if (!days.includes(dayName)) continue;

        const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];
        records.push({
          studentId: student.id,
          subjectId: subject.id,
          date: date,
          status: status,
        });
      }
    }

    // Batch insert
    for (let i = 0; i < records.length; i += 50) {
      try {
        await prisma.attendance.createMany({ data: records.slice(i, i + 50), skipDuplicates: true });
      } catch (e) {
        // Skip duplicates
      }
    }
    attendanceCount += records.length;
  }
  console.log(`  ✅ Created ~${attendanceCount} attendance records`);

  // ─── Create Internal Marks ───────────────────────────────────────
  console.log('📝 Creating internal marks...');

  let marksCount = 0;
  for (const student of createdStudents) {
    if (Math.random() > 0.7) continue; // 70% get marks

    const studentSubjects = allSubjects.filter(
      s => s.department === student.department && s.semester === student.semester
    );

    for (const subject of studentSubjects.slice(0, 4)) {
      const test1 = 10 + Math.random() * 15;
      const test2 = 10 + Math.random() * 15;
      const assignment1 = 5 + Math.random() * 5;
      const assignment2 = 5 + Math.random() * 5;
      const total = Math.round((test1 + test2 + assignment1 + assignment2) * 100) / 100;

      try {
        await prisma.internalMark.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            test1,
            test2,
            assignment1,
            assignment2,
            total,
            maxMarks: 50,
            semester: student.semester,
          },
        });
        marksCount++;
      } catch (e) {
        // Skip if exists
      }
    }
  }
  console.log(`  ✅ Created ${marksCount} internal mark records`);

  // ─── Create Fee Records ──────────────────────────────────────────
  console.log('💰 Creating fee records...');

  let feeCount = 0;
  for (const student of createdStudents) {
    if (Math.random() > 0.8) continue; // 80% get fee records

    const feeTypes = ['tuition', 'hostel', 'exam', 'library'];
    for (const type of feeTypes) {
      const isPaid = Math.random() > 0.3;
      const amount = type === 'tuition' ? 75000 : type === 'hostel' ? 30000 : type === 'exam' ? 5000 : 2000;
      const dueDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);

      await prisma.fee.create({
        data: {
          studentId: student.id,
          type,
          amount,
          paid: isPaid,
          dueDate,
          paidDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
          semester: student.semester,
        },
      });
      feeCount++;
    }
  }
  console.log(`  ✅ Created ${feeCount} fee records`);

  // ─── Create Complaint Records ────────────────────────────────────
  console.log('🔴 Creating complaint records...');

  const complaintData = [
    { type: 'room', description: 'Water leakage in hostel room ceiling', priority: 'high' },
    { type: 'mess', description: 'Unhygienic food served in cafeteria', priority: 'high' },
    { type: 'wifi', description: 'WiFi not working in Block B since 2 days', priority: 'medium' },
    { type: 'room', description: 'Broken window in hostel room', priority: 'low' },
    { type: 'mess', description: 'Limited food options for vegetarians', priority: 'medium' },
    { type: 'wifi', description: 'Slow internet speed in library area', priority: 'medium' },
    { type: 'laundry', description: 'Washing machines not working in H2', priority: 'low' },
    { type: 'room', description: 'Fan not working in room H3-315', priority: 'high' },
    { type: 'other', description: 'Parking area needs better lighting', priority: 'low' },
    { type: 'mess', description: 'Cafeteria timings too short for dinner', priority: 'medium' },
    { type: 'wifi', description: 'No WiFi coverage in sports complex', priority: 'medium' },
    { type: 'room', description: 'Geyser not working in H4 bathroom', priority: 'high' },
  ];

  const complaintStatuses = ['open', 'in_progress', 'resolved', 'open', 'in_progress'];
  let complaintCount = 0;

  for (let i = 0; i < complaintData.length; i++) {
    const studentIdx = i % createdStudents.length;
    const status = complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)];
    await prisma.complaint.create({
      data: {
        studentId: createdStudents[studentIdx].id,
        type: complaintData[i].type,
        description: complaintData[i].description,
        status,
        priority: complaintData[i].priority,
      },
    });
    complaintCount++;
  }
  console.log(`  ✅ Created ${complaintCount} complaint records`);

  // ─── Create Leave Requests ───────────────────────────────────────
  console.log('📝 Creating leave requests...');

  const leaveData = [
    { type: 'medical', reason: 'Dental surgery recovery', days: 3 },
    { type: 'personal', reason: 'Family function in hometown', days: 2 },
    { type: 'medical', reason: 'Viral fever', days: 4 },
    { type: 'academic', reason: 'Attending conference at IIT Delhi', days: 3 },
    { type: 'personal', reason: 'Sister\'s wedding', days: 5 },
    { type: 'medical', reason: 'Eye checkup at specialized hospital', days: 1 },
    { type: 'academic', reason: 'Paper presentation at IEEE conference', days: 2 },
    { type: 'personal', reason: 'Family emergency', days: 3 },
    { type: 'medical', reason: 'Sports injury - ankle sprain', days: 2 },
    { type: 'academic', reason: 'Hackathon at another college', days: 2 },
  ];

  const leaveStatuses = ['approved', 'pending', 'rejected', 'approved', 'pending'];
  let leaveCount = 0;

  for (let i = 0; i < leaveData.length; i++) {
    const studentIdx = i % createdStudents.length;
    const status = leaveStatuses[Math.floor(Math.random() * leaveStatuses.length)];
    const startDate = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + leaveData[i].days * 24 * 60 * 60 * 1000);

    await prisma.leaveRequest.create({
      data: {
        studentId: createdStudents[studentIdx].id,
        type: leaveData[i].type,
        startDate,
        endDate,
        reason: leaveData[i].reason,
        status,
        approvedBy: status === 'approved' ? 'Dr. Rajesh Sharma' : null,
      },
    });
    leaveCount++;
  }
  console.log(`  ✅ Created ${leaveCount} leave request records`);

  // ─── Create Book Transactions ────────────────────────────────────
  console.log('📚 Creating book transactions...');

  const existingBooks = await prisma.book.findMany();
  let transactionCount = 0;

  for (let i = 0; i < 15; i++) {
    const studentIdx = Math.floor(Math.random() * createdStudents.length);
    const bookIdx = Math.floor(Math.random() * existingBooks.length);
    const isReturned = Math.random() > 0.4;
    const borrowDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    try {
      await prisma.bookTransaction.create({
        data: {
          bookId: existingBooks[bookIdx].id,
          studentId: createdStudents[studentIdx].id,
          borrowDate,
          dueDate,
          returnDate: isReturned ? new Date(borrowDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
          fine: isReturned && Math.random() > 0.7 ? Math.round(Math.random() * 50 * 100) / 100 : 0,
          status: isReturned ? 'returned' : 'borrowed',
        },
      });
      transactionCount++;
    } catch (e) {
      // Skip on error
    }
  }
  console.log(`  ✅ Created ${transactionCount} book transaction records`);

  // ─── Create Placement Records ────────────────────────────────────
  console.log('💼 Creating placement records...');

  const placementCompanies = [
    { company: 'Google', role: 'SDE Intern', package: 45000 },
    { company: 'Microsoft', role: 'Software Engineer Intern', package: 40000 },
    { company: 'Amazon', role: 'SDE Intern', package: 42000 },
    { company: 'TCS', role: 'Systems Engineer', package: 7000 },
    { company: 'Infosys', role: 'Power Programmer', package: 10000 },
    { company: 'Wipro', role: 'Project Engineer', package: 6000 },
    { company: 'Deloitte', role: 'Analyst', package: 15000 },
    { company: 'Flipkart', role: 'SDE-1', package: 32000 },
    { company: 'Adobe', role: 'MTS Intern', package: 38000 },
    { company: 'Oracle', role: 'Application Engineer', package: 25000 },
    { company: 'Samsung', role: 'R&D Engineer', package: 20000 },
    { company: 'L&T', role: 'GET', package: 8000 },
    { company: 'Tata Motors', role: 'Graduate Trainee', package: 7500 },
    { company: 'ISRO', role: 'Scientist/Engineer', package: 12000 },
    { company: 'Infosys', role: 'SP', package: 12000 },
  ];

  const placementStatuses = ['applied', 'interview', 'offered', 'rejected', 'placed'];
  let placementCount = 0;

  // Place students with "placed" or "interview" status
  for (const student of createdStudents) {
    if (student._placement === 'placed') {
      // Give them 1-2 placed records
      for (let j = 0; j < 1 + Math.floor(Math.random() * 2); j++) {
        const company = placementCompanies[Math.floor(Math.random() * placementCompanies.length)];
        await prisma.placement.create({
          data: {
            studentId: student.id,
            companyName: company.company,
            role: company.role,
            package: company.package,
            status: 'placed',
            interviewDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          },
        });
        placementCount++;
      }
    } else if (student._placement === 'interview') {
      // Give them 1-2 interview records
      for (let j = 0; j < 1 + Math.floor(Math.random() * 2); j++) {
        const company = placementCompanies[Math.floor(Math.random() * placementCompanies.length)];
        await prisma.placement.create({
          data: {
            studentId: student.id,
            companyName: company.company,
            role: company.role,
            package: company.package,
            status: j === 0 ? 'interview' : 'applied',
            interviewDate: new Date(Date.now() + Math.random() * 20 * 24 * 60 * 60 * 1000),
          },
        });
        placementCount++;
      }
    } else {
      // Give them 1-2 applied records
      if (Math.random() > 0.4) {
        for (let j = 0; j < 1 + Math.floor(Math.random() * 2); j++) {
          const company = placementCompanies[Math.floor(Math.random() * placementCompanies.length)];
          await prisma.placement.create({
            data: {
              studentId: student.id,
              companyName: company.company,
              role: company.role,
              package: company.package,
              status: Math.random() > 0.3 ? 'applied' : 'rejected',
            },
          });
          placementCount++;
        }
      }
    }
  }
  console.log(`  ✅ Created ${placementCount} placement records`);

  // ─── Create Additional Books ─────────────────────────────────────
  console.log('📖 Creating additional books...');

  const newBookData = [
    { title: 'Signals and Systems', author: 'Oppenheim, Willsky', isbn: '978-0138147570', category: 'Electronics', shelf: 'C2-05', total: 6, available: 4, desc: 'Fundamental text on signals and systems analysis.' },
    { title: 'Power Electronics', author: 'Rashid Muhammad', isbn: '978-0133125900', category: 'Electrical', shelf: 'D1-08', total: 4, available: 3, desc: 'Comprehensive guide to power electronics devices and circuits.' },
    { title: 'Manufacturing Technology Vol. 1', author: 'P.N. Rao', isbn: '978-0070087993', category: 'Mechanical', shelf: 'E1-02', total: 5, available: 4, desc: 'Foundations of manufacturing processes and technology.' },
    { title: 'Strength of Materials', author: 'R.K. Rajput', isbn: '978-8131808147', category: 'Civil', shelf: 'F1-10', total: 7, available: 5, desc: 'Comprehensive coverage of mechanics of materials.' },
    { title: 'Fluid Mechanics and Hydraulic Machines', author: 'R.K. Rajput', isbn: '978-8131808161', category: 'Mechanical', shelf: 'E2-04', total: 5, available: 3, desc: 'Complete text on fluid mechanics and hydraulic machinery.' },
    { title: 'Digital Logic and Computer Design', author: 'M. Morris Mano', isbn: '978-0132145109', category: 'Electronics', shelf: 'C3-01', total: 6, available: 4, desc: 'Classic text on digital logic design fundamentals.' },
    { title: 'Software Testing: Principles and Practices', author: 'Srinivasan Desikan', isbn: '978-8131759083', category: 'Software Engineering', shelf: 'D3-06', total: 4, available: 3, desc: 'Comprehensive guide to software testing methodologies.' },
    { title: 'Cloud Computing: Concepts and Technology', author: 'Thomas Erl', isbn: '978-0133387526', category: 'Cloud Computing', shelf: 'A5-03', total: 3, available: 2, desc: 'In-depth coverage of cloud computing architecture and patterns.' },
    { title: 'Engineering Mathematics Vol. 2', author: 'B.S. Grewal', isbn: '978-8174092313', category: 'Mathematics', shelf: 'G1-01', total: 10, available: 7, desc: 'Essential mathematics for engineering students.' },
    { title: 'Embedded Systems: Architecture and Programming', author: 'Raj Kamal', isbn: '978-0070154234', category: 'Electronics', shelf: 'C4-08', total: 4, available: 2, desc: 'Introduction to embedded system design and programming.' },
    { title: 'Data Structures Through C', author: 'G.S. Baluja', isbn: '978-8173712050', category: 'Computer Science', shelf: 'A2-07', total: 8, available: 5, desc: 'Practical approach to data structures using C language.' },
    { title: 'Environmental Engineering', author: 'S.K. Garg', isbn: '978-8174092306', category: 'Civil', shelf: 'F2-03', total: 5, available: 4, desc: 'Comprehensive coverage of environmental engineering principles.' },
  ];

  let bookCount = 0;
  for (const bd of newBookData) {
    try {
      await prisma.book.create({
        data: {
          title: bd.title,
          author: bd.author,
          isbn: bd.isbn,
          category: bd.category,
          shelfLocation: bd.shelf,
          totalCopies: bd.total,
          availableCopies: bd.available,
          description: bd.desc,
        },
      });
      bookCount++;
    } catch (e) {
      // Skip if exists
    }
  }
  console.log(`  ✅ Created ${bookCount} additional books`);

  // ─── Create Additional Events ────────────────────────────────────
  console.log('🎉 Creating additional events...');

  const newEventData = [
    { title: 'Robotics Challenge 2025', desc: 'Build and program robots to navigate an obstacle course. Team event with prizes worth ₹1,00,000.', type: 'hackathon', organizer: 'Robotics Club', startOffset: 12, endOffset: 13, venue: 'Robotics Lab', max: 40 },
    { title: 'National Science Symposium', desc: 'Annual science symposium featuring talks by leading researchers and paper presentations by students.', type: 'seminar', organizer: 'Science Forum', startOffset: 20, endOffset: 21, venue: 'Main Auditorium', max: 300 },
    { title: 'Inter-College Sports Meet', desc: 'Annual athletics and sports competition between 15 colleges. Events include cricket, football, basketball, and track & field.', type: 'sports', organizer: 'Sports Committee', startOffset: 25, endOffset: 28, venue: 'Sports Complex', max: 500 },
    { title: 'Python for Data Science Bootcamp', desc: '3-day intensive bootcamp covering Python, Pandas, NumPy, and visualization libraries.', type: 'workshop', organizer: 'Data Science Club', startOffset: 8, endOffset: 10, venue: 'Lab 401', max: 60 },
    { title: 'Entrepreneurship Summit', desc: 'Panel discussions with successful entrepreneurs, VC networking, and pitch sessions for student startups.', type: 'seminar', organizer: 'E-Cell', startOffset: 18, endOffset: 18, venue: 'Convention Center', max: 200 },
  ];

  let eventCount = 0;
  for (const ed of newEventData) {
    const startDate = new Date(Date.now() + ed.startOffset * 24 * 60 * 60 * 1000);
    const endDate = ed.endOffset !== ed.startOffset
      ? new Date(Date.now() + ed.endOffset * 24 * 60 * 60 * 1000)
      : null;

    await prisma.event.create({
      data: {
        title: ed.title,
        description: ed.desc,
        type: ed.type,
        organizer: ed.organizer,
        startDate,
        endDate,
        venue: ed.venue,
        registrationOpen: true,
        maxParticipants: ed.max,
      },
    });
    eventCount++;
  }
  console.log(`  ✅ Created ${eventCount} additional events`);

  // ─── Create Some Event Participations ─────────────────────────────
  console.log('🎫 Creating event participations...');

  const allEvents = await prisma.event.findMany();
  let partCount = 0;

  for (const student of createdStudents) {
    // Each student participates in 1-3 random events
    const numEvents = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...allEvents].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numEvents, shuffled.length); i++) {
      try {
        await prisma.eventParticipant.create({
          data: {
            eventId: shuffled[i].id,
            studentId: student.id,
            registeredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        });
        partCount++;
      } catch (e) {
        // Skip duplicates
      }
    }
  }
  console.log(`  ✅ Created ${partCount} event participation records`);

  // ─── Final Summary ───────────────────────────────────────────────
  const totalStudents = await prisma.student.count();
  const totalFaculty = await prisma.faculty.count();
  const totalSubjects = await prisma.subject.count();
  const totalBooks = await prisma.book.count();
  const totalEvents = await prisma.event.count();
  const totalPlacements = await prisma.placement.count();
  const totalFees = await prisma.fee.count();
  const totalComplaints = await prisma.complaint.count();
  const totalAttendance = await prisma.attendance.count();

  console.log('\n🎉 Admin seed data created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📊 Total Students:      ${totalStudents}`);
  console.log(`  👨‍🏫 Total Faculty:       ${totalFaculty}`);
  console.log(`  📚 Total Subjects:      ${totalSubjects}`);
  console.log(`  📖 Total Books:         ${totalBooks}`);
  console.log(`  🎉 Total Events:        ${totalEvents}`);
  console.log(`  💼 Total Placements:    ${totalPlacements}`);
  console.log(`  💰 Total Fee Records:   ${totalFees}`);
  console.log(`  🔴 Total Complaints:    ${totalComplaints}`);
  console.log(`  📋 Total Attendance:    ${totalAttendance}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
