import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.aiMemory.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.bookTransaction.deleteMany();
  await prisma.book.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.internalMark.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.subjectEnrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();

  // Create Faculty Users
  const facultyUsers = await Promise.all([
    prisma.user.create({ data: { email: 'dr.sharma@campus.edu', name: 'Dr. Rajesh Sharma', role: 'faculty', department: 'Computer Science', avatar: '' } }),
    prisma.user.create({ data: { email: 'dr.patel@campus.edu', name: 'Dr. Anita Patel', role: 'faculty', department: 'Computer Science', avatar: '' } }),
    prisma.user.create({ data: { email: 'dr.kumar@campus.edu', name: 'Dr. Vikram Kumar', role: 'faculty', department: 'Information Technology', avatar: '' } }),
    prisma.user.create({ data: { email: 'dr.singh@campus.edu', name: 'Dr. Priya Singh', role: 'faculty', department: 'Electronics', avatar: '' } }),
    prisma.user.create({ data: { email: 'dr.gupta@campus.edu', name: 'Dr. Amit Gupta', role: 'faculty', department: 'Computer Science', avatar: '' } }),
    prisma.user.create({ data: { email: 'dr.venkat@campus.edu', name: 'Dr. Venkat Rao', role: 'faculty', department: 'Mathematics', avatar: '' } }),
  ]);

  const faculties = await Promise.all([
    prisma.faculty.create({ data: { userId: facultyUsers[0].id, department: 'Computer Science', designation: 'Professor', cabinLocation: 'Block A-201' } }),
    prisma.faculty.create({ data: { userId: facultyUsers[1].id, department: 'Computer Science', designation: 'Associate Professor', cabinLocation: 'Block A-205' } }),
    prisma.faculty.create({ data: { userId: facultyUsers[2].id, department: 'Information Technology', designation: 'Assistant Professor', cabinLocation: 'Block B-102' } }),
    prisma.faculty.create({ data: { userId: facultyUsers[3].id, department: 'Electronics', designation: 'Professor', cabinLocation: 'Block C-301' } }),
    prisma.faculty.create({ data: { userId: facultyUsers[4].id, department: 'Computer Science', designation: 'Assistant Professor', cabinLocation: 'Block A-310' } }),
    prisma.faculty.create({ data: { userId: facultyUsers[5].id, department: 'Mathematics', designation: 'Professor', cabinLocation: 'Block D-105' } }),
  ]);

  // Create Subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { code: 'CS601', name: 'Machine Learning', department: 'Computer Science', semester: 6, credits: 4, facultyId: faculties[0].id, schedule: JSON.stringify({ days: ['Monday', 'Wednesday', 'Friday'], time: '10:00 AM - 11:00 AM', room: 'LH-201' }) } }),
    prisma.subject.create({ data: { code: 'CS602', name: 'Database Management Systems', department: 'Computer Science', semester: 6, credits: 4, facultyId: faculties[1].id, schedule: JSON.stringify({ days: ['Tuesday', 'Thursday'], time: '11:00 AM - 12:30 PM', room: 'LH-305' }) } }),
    prisma.subject.create({ data: { code: 'CS603', name: 'Computer Networks', department: 'Computer Science', semester: 6, credits: 3, facultyId: faculties[2].id, schedule: JSON.stringify({ days: ['Monday', 'Wednesday'], time: '2:00 PM - 3:30 PM', room: 'LH-102' }) } }),
    prisma.subject.create({ data: { code: 'CS604', name: 'Software Engineering', department: 'Computer Science', semester: 6, credits: 3, facultyId: faculties[4].id, schedule: JSON.stringify({ days: ['Tuesday', 'Thursday'], time: '2:00 PM - 3:30 PM', room: 'LH-401' }) } }),
    prisma.subject.create({ data: { code: 'CS605', name: 'Deep Learning', department: 'Computer Science', semester: 6, credits: 3, facultyId: faculties[0].id, schedule: JSON.stringify({ days: ['Friday'], time: '2:00 PM - 5:00 PM', room: 'Lab-301' }) } }),
    prisma.subject.create({ data: { code: 'MA601', name: 'Probability & Statistics', department: 'Mathematics', semester: 6, credits: 3, facultyId: faculties[5].id, schedule: JSON.stringify({ days: ['Monday', 'Wednesday'], time: '9:00 AM - 10:00 AM', room: 'LH-101' }) } }),
  ]);

  // Create Student User
  const studentUser = await prisma.user.create({
    data: {
      email: 'sam.kumar@campus.edu',
      name: 'Sam Kumar',
      role: 'student',
      department: 'Computer Science',
      phone: '+91 98765 43210',
      avatar: '',
    }
  });

  // Create Student
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      rollNumber: 'CS2022001',
      department: 'Computer Science',
      semester: 6,
      section: 'A',
      cgpa: 8.72,
      hostelRoom: 'H4-207',
      guardianName: 'Ramesh Kumar',
      guardianPhone: '+91 87654 32109',
      skills: JSON.stringify(['Python', 'TensorFlow', 'React', 'Node.js', 'SQL', 'Docker', 'Git', 'Java', 'C++']),
      placementStatus: 'seeking',
    }
  });

  // Enroll student in subjects
  await Promise.all(subjects.map(subject =>
    prisma.subjectEnrollment.create({
      data: { studentId: student.id, subjectId: subject.id, semester: 6 }
    })
  ));

  // Create Attendance Records (last 60 days)
  const attendanceRecords = [];
  const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'late'];
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    for (const subject of subjects) {
      const schedule = JSON.parse(subject.schedule || '{}');
      const days = schedule.days || [];
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      if (!days.includes(dayName)) continue;

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      attendanceRecords.push({
        studentId: student.id,
        subjectId: subject.id,
        date: date,
        status: status,
      });
    }
  }

  // Batch create attendance
  for (let i = 0; i < attendanceRecords.length; i += 50) {
    await prisma.attendance.createMany({ data: attendanceRecords.slice(i, i + 50) });
  }

  // Calculate actual attendance stats
  const allAttendance = await prisma.attendance.findMany({ where: { studentId: student.id } });
  const totalClasses = allAttendance.length;
  const presentClasses = allAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const overallAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Create Internal Marks
  await Promise.all(subjects.map(subject =>
    prisma.internalMark.create({
      data: {
        studentId: student.id,
        subjectId: subject.id,
        test1: 15 + Math.random() * 10,
        test2: 14 + Math.random() * 10,
        assignment1: 7 + Math.random() * 3,
        assignment2: 7 + Math.random() * 3,
        total: 0,
        maxMarks: 50,
        semester: 6,
      }
    })
  ));

  // Calculate totals
  const internalMarks = await prisma.internalMark.findMany({ where: { studentId: student.id } });
  for (const mark of internalMarks) {
    const total = (mark.test1 || 0) + (mark.test2 || 0) + (mark.assignment1 || 0) + (mark.assignment2 || 0);
    await prisma.internalMark.update({ where: { id: mark.id }, data: { total: Math.round(total * 100) / 100 } });
  }

  // Create Assignments
  const assignments = await Promise.all([
    prisma.assignment.create({ data: { subjectId: subjects[0].id, title: 'Implement SVM Classifier', description: 'Build a Support Vector Machine classifier using scikit-learn on the Iris dataset. Report accuracy, precision, recall.', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), maxMarks: 10 } }),
    prisma.assignment.create({ data: { subjectId: subjects[0].id, title: 'Neural Network from Scratch', description: 'Implement a 3-layer neural network from scratch using only NumPy.', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), maxMarks: 15 } }),
    prisma.assignment.create({ data: { subjectId: subjects[1].id, title: 'ER Diagram for Hospital System', description: 'Design an ER diagram for a hospital management system with at least 8 entities.', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), maxMarks: 10 } }),
    prisma.assignment.create({ data: { subjectId: subjects[2].id, title: 'TCP vs UDP Analysis', description: 'Compare TCP and UDP protocols with practical examples and packet analysis using Wireshark.', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), maxMarks: 10 } }),
    prisma.assignment.create({ data: { subjectId: subjects[3].id, title: 'SRS Document for E-Learning Platform', description: 'Write a complete Software Requirements Specification document.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), maxMarks: 15 } }),
  ]);

  // Create some assignment submissions
  await prisma.assignmentSubmission.create({ data: { assignmentId: assignments[0].id, studentId: student.id, submittedAt: new Date(), status: 'submitted' } });

  // Create Books
  const books = await Promise.all([
    prisma.book.create({ data: { title: 'Introduction to Machine Learning', author: 'Alpaydin Ethem', isbn: '978-0262028189', category: 'Machine Learning', shelfLocation: 'A3-12', totalCopies: 5, availableCopies: 3, description: 'A comprehensive introduction to machine learning covering supervised, unsupervised, and reinforcement learning.' } }),
    prisma.book.create({ data: { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', isbn: '978-1119800361', category: 'Operating Systems', shelfLocation: 'B1-05', totalCopies: 8, availableCopies: 5, description: 'The classic operating systems textbook, also known as the "Dinosaur Book".' } }),
    prisma.book.create({ data: { title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', isbn: '978-0078022159', category: 'Databases', shelfLocation: 'B2-08', totalCopies: 6, availableCopies: 4, description: 'Comprehensive coverage of database concepts, SQL, and database design.' } }),
    prisma.book.create({ data: { title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', isbn: '978-0136681557', category: 'Networking', shelfLocation: 'C1-03', totalCopies: 4, availableCopies: 2, description: 'Top-down approach to computer networking, from application layer to physical layer.' } }),
    prisma.book.create({ data: { title: 'Deep Learning', author: 'Goodfellow, Bengio, Courville', isbn: '978-0262035613', category: 'Deep Learning', shelfLocation: 'A3-15', totalCopies: 3, availableCopies: 1, description: 'The definitive textbook on deep learning, covering mathematical foundations to practical applications.' } }),
    prisma.book.create({ data: { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Software Engineering', shelfLocation: 'D2-10', totalCopies: 7, availableCopies: 5, description: 'A handbook of agile software craftsmanship that teaches writing clean, maintainable code.' } }),
    prisma.book.create({ data: { title: 'Design Patterns', author: 'Gamma, Helm, Johnson, Vlissides', isbn: '978-0201633610', category: 'Software Engineering', shelfLocation: 'D2-12', totalCopies: 4, availableCopies: 3, description: 'Elements of reusable object-oriented software - the classic Gang of Four book.' } }),
    prisma.book.create({ data: { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell, Norvig', isbn: '978-0134610993', category: 'Artificial Intelligence', shelfLocation: 'A4-01', totalCopies: 5, availableCopies: 4, description: 'The most comprehensive AI textbook covering search, planning, knowledge representation, and learning.' } }),
  ]);

  // Create Book Transaction
  await prisma.bookTransaction.create({
    data: {
      bookId: books[0].id,
      studentId: student.id,
      borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'borrowed',
    }
  });

  // Create Placements
  await Promise.all([
    prisma.placement.create({ data: { studentId: student.id, companyName: 'Google', role: 'SDE Intern', package: 45000, status: 'interview', interviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } }),
    prisma.placement.create({ data: { studentId: student.id, companyName: 'Microsoft', role: 'Software Engineer Intern', package: 40000, status: 'applied' } }),
    prisma.placement.create({ data: { studentId: student.id, companyName: 'Amazon', role: 'SDE Intern', package: 42000, status: 'rejected' } }),
  ]);

  // Create Events
  const events = await Promise.all([
    prisma.event.create({ data: { title: 'CodeStorm Hackathon 2025', description: '24-hour hackathon with exciting prizes. Build innovative solutions for real-world problems.', type: 'hackathon', organizer: 'Tech Club', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), venue: 'Main Auditorium', registrationOpen: true, maxParticipants: 200 } }),
    prisma.event.create({ data: { title: 'AI/ML Workshop', description: 'Hands-on workshop on building AI applications with Python and TensorFlow.', type: 'workshop', organizer: 'AI Society', startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), venue: 'Lab 301', registrationOpen: true, maxParticipants: 50 } }),
    prisma.event.create({ data: { title: 'Tech Talk: Future of Cloud Computing', description: 'Industry expert talk on cloud architecture and career opportunities.', type: 'seminar', organizer: 'CS Department', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), venue: 'Seminar Hall 2', registrationOpen: true, maxParticipants: 150 } }),
    prisma.event.create({ data: { title: 'Annual Cultural Fest - Verdana', description: 'Three-day cultural festival with music, dance, drama, and art competitions.', type: 'cultural', organizer: 'Student Council', startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), venue: 'Open Air Theatre', registrationOpen: true } }),
    prisma.event.create({ data: { title: 'Startup Pitch Competition', description: 'Pitch your startup idea to a panel of VCs and angel investors. Win seed funding!', type: 'hackathon', organizer: 'E-Cell', startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), venue: 'Conference Hall', registrationOpen: true, maxParticipants: 30 } }),
  ]);

  // Create Event Participations
  await prisma.eventParticipant.create({ data: { eventId: events[0].id, studentId: student.id, registeredAt: new Date() } });
  await prisma.eventParticipant.create({ data: { eventId: events[1].id, studentId: student.id, registeredAt: new Date() } });

  // Create Complaints
  await Promise.all([
    prisma.complaint.create({ data: { studentId: student.id, type: 'room', description: 'AC not working in room H4-207', status: 'in_progress', priority: 'high' } }),
    prisma.complaint.create({ data: { studentId: student.id, type: 'mess', description: 'Food quality needs improvement', status: 'open', priority: 'medium' } }),
  ]);

  // Create Leave Requests
  await prisma.leaveRequest.create({
    data: {
      studentId: student.id,
      type: 'medical',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reason: 'Fever and cold',
      status: 'approved',
      approvedBy: 'Dr. Rajesh Sharma',
    }
  });

  // Create Fees
  await Promise.all([
    prisma.fee.create({ data: { studentId: student.id, type: 'tuition', amount: 75000, paid: true, dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), semester: 6 } }),
    prisma.fee.create({ data: { studentId: student.id, type: 'hostel', amount: 30000, paid: true, dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000), semester: 6 } }),
    prisma.fee.create({ data: { studentId: student.id, type: 'exam', amount: 5000, paid: false, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), semester: 6 } }),
    prisma.fee.create({ data: { studentId: student.id, type: 'library', amount: 2000, paid: false, dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), semester: 6 } }),
  ]);

  // Create AI Memories
  await Promise.all([
    prisma.aiMemory.create({ data: { studentId: student.id, category: 'preference', content: 'Prefers morning study sessions' } }),
    prisma.aiMemory.create({ data: { studentId: student.id, category: 'weak_subject', content: 'Struggles with probability and statistics' } }),
    prisma.aiMemory.create({ data: { studentId: student.id, category: 'goal', content: 'Wants to become an AI/ML Engineer at a top tech company' } }),
    prisma.aiMemory.create({ data: { studentId: student.id, category: 'learning_style', content: 'Visual learner, prefers hands-on projects over theory' } }),
  ]);

  // Create Notifications
  await Promise.all([
    prisma.notification.create({ data: { userId: studentUser.id, title: 'Assignment Due Soon', message: 'SVM Classifier assignment is due in 3 days', type: 'warning', actionUrl: '/assignments' } }),
    prisma.notification.create({ data: { userId: studentUser.id, title: 'Hackathon Registration Open', message: 'CodeStorm Hackathon 2025 - Register now!', type: 'info', actionUrl: '/events' } }),
    prisma.notification.create({ data: { userId: studentUser.id, title: 'Google Interview Scheduled', message: 'Your interview is scheduled for next week', type: 'success' } }),
    prisma.notification.create({ data: { userId: studentUser.id, title: 'Fee Due', message: 'Exam fee of ₹5,000 is due in 7 days', type: 'warning' } }),
    prisma.notification.create({ data: { userId: studentUser.id, title: 'Complaint Update', message: 'Your AC complaint has been assigned to maintenance', type: 'info' } }),
  ]);

  // Create Admin User
  await prisma.user.create({
    data: {
      email: 'admin@campus.edu',
      name: 'Admin User',
      role: 'admin',
      department: 'Administration',
    }
  });

  console.log('✅ Seed data created successfully!');
  console.log(`   Student: Sam Kumar (CS2022001)`);
  console.log(`   Email: sam.kumar@campus.edu`);
  console.log(`   CGPA: 8.72`);
  console.log(`   Overall Attendance: ${overallAttendance}%`);
  console.log(`   Total Classes: ${totalClasses}`);
  console.log(`   Present Classes: ${presentClasses}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
