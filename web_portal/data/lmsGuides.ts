export interface LMSGuide {
    id: number;
    title: string;
    icon: string;
    steps: string[];
    tips: string[];
}

export const lmsGuides: LMSGuide[] = [
    {
        id: 1, title: 'How to Submit Assignment', icon: '📝',
        steps: ['Login to VULMS portal', 'Go to your course page', 'Click on "Assignments" tab', 'Find the active assignment', 'Click "Upload" or "Submit" button', 'Select your file (Word/PDF)', 'Add comments if needed', 'Click "Submit Assignment"', 'Verify submission confirmation'],
        tips: ['Submit at least 1 day before deadline', 'Keep file size under 5MB', 'Use proper format (Word or PDF)', 'Save a copy before submitting']
    },
    {
        id: 2, title: 'How to Attempt GDB', icon: '💬',
        steps: ['Login to VULMS', 'Navigate to your course', 'Click "GDB" section', 'Read the GDB topic carefully', 'Click "Add Discussion" or "Reply"', 'Type your response (150-200 words)', 'Review your answer', 'Click "Submit"'],
        tips: ['GDB is usually open for 2-3 days', 'Write original content only', 'Keep it concise and relevant', 'Copy your answer before submitting']
    },
    {
        id: 3, title: 'How to Attempt Quiz', icon: '❓',
        steps: ['Login to VULMS', 'Go to your course page', 'Click "Quizzes" tab', 'Click on active quiz', 'Read instructions carefully', 'Note the time limit', 'Click "Start Quiz"', 'Answer questions one by one', 'Review answers if time permits', 'Click "Submit Quiz"'],
        tips: ['Stable internet is essential', 'Do not refresh the page', 'Quiz auto-submits when time ends', 'You cannot reattempt a quiz']
    },
    {
        id: 4, title: 'How to Check Result', icon: '📊',
        steps: ['Login to VULMS', 'Click "My Results" from menu', 'Select semester', 'View your grades and GPA', 'Download result card if needed'],
        tips: ['Results usually appear within 2-3 weeks after finals', 'Check for any grade disputes within deadline', 'Keep screenshot of results for records']
    },
    {
        id: 5, title: 'How to Reappear in Exam', icon: '🔄',
        steps: ['Login to VULMS', 'Go to "Student Services"', 'Click "Re-appear" or "Improvement"', 'Select the course', 'Pay the reappear fee', 'Confirm registration', 'Check date sheet for exam schedule'],
        tips: ['Reappear fee is usually RS 2000-3000', 'Apply before the deadline', 'You can improve grade by reappearing', 'Only final exam can be reattempted']
    },
    {
        id: 6, title: 'How to Apply for Transcript', icon: '📄',
        steps: ['Login to VULMS', 'Go to "Student Services"', 'Click "Apply for Transcript"', 'Select transcript type (Standard/Urgent)', 'Fill in delivery address', 'Pay the transcript fee', 'Submit application', 'Track status in your portal'],
        tips: ['Standard processing takes 15-20 days', 'Urgent takes 5-7 working days', 'Fee varies by type and delivery method', 'Keep receipt for tracking']
    },
    {
        id: 7, title: 'How to Make Date Sheet', icon: '📅',
        steps: ['Login to VULMS', 'Click on "Make Your Date Sheet" link (active during exam days)', 'Login to the Date Sheet interface', 'Select your Exam City', 'Choose your Exam Center', 'Select date and time for each paper', 'Click "Confirm"', 'Print your Entrance Slip'],
        tips: ['Date sheets open on a first-come-first-serve basis', 'Seats in preferred centers fill up fast', 'Once confirmed, changing the date sheet is difficult', 'Entrance slip is mandatory for exams']
    },
    {
        id: 8, title: 'How to Select Courses', icon: '📚',
        steps: ['Login to VULMS', 'Go to "Course Selection" tab', 'Check your "Study Scheme"', 'Enable toggle button for desired courses', 'Check credit hour limit', 'Click "Save Selection"', 'Verify selected courses in Home tab'],
        tips: ['Follow the semester-wise scheme', 'Failures (F grade) must be cleared first', 'D grade courses can be improved', 'Maximum credit hours depend on your CGPA']
    },
    {
        id: 9, title: 'Need-Based Scholarship', icon: '💰',
        steps: ['Wait for the scholarship announcement (usually start of semester)', 'Login to VULMS', 'Go to "Student Services" -> "Scholarship"', 'Fill out the Need-Based Scholarship form details', 'Upload required documents (Salary slip, Bills, etc.)', 'Submit the application'],
        tips: ['Provide authentic financial data', 'Incomplete applications are rejected', 'Maintain a good GPA to stay eligible', 'Interview may be conducted']
    },
    {
        id: 10, title: 'How to Freeze Semester', icon: '❄️',
        steps: ['Login to VULMS', 'Go to "Student Services"', 'Click "Semester Freeze"', 'Select the semester reason', 'Submit request', 'Pay the "Semester Freeze Fee" if applicable'],
        tips: ['First semester cannot be frozen usually', 'You must feeze before the deadline (Academic Calendar)', 'Frozen semester does not count in CGPA', 'Duration of degree extends by 6 months']
    },
    {
        id: 11, title: 'How to Change Campus', icon: '🏫',
        steps: ['Login to VULMS', 'Go to "Student Services"', 'Click "Campus Change Request"', 'Select "Virtual Campus" (Home) or "PVC" (Private Campus)', 'Select the specific city and campus', 'Submit request', 'Pay the Challan fee'],
        tips: ['Campus change is effective from next semester usually', 'Overseas to Local requires document verification', 'Fee differs for "At Home" vs "Campus" students']
    },
    {
        id: 12, title: 'Improvement of "D" Grade', icon: '📈',
        steps: ['Wait for Course Selection to open', 'In Course Selection, look for passed courses with "D" grade', 'Select them for improvement', 'Complete course activities again', 'New grade will replace the old one ONLY if better'],
        tips: ['Improving a course counts towards credit hour intervals', 'Highest grade is kept (Best of two)', 'Fee is charged for the improved course', 'Good strategy to boost CGPA']
    },
    {
        id: 13, title: 'Forgot VULMS Password', icon: '🔐',
        steps: ['Go to vulms.vu.edu.pk', 'Click "Forgot Password"', 'Enter your Student ID', 'Select "Email" or "Personal Email"', 'Check your inbox for the reset link', 'Set a new strong password'],
        tips: ['Keep your registered mobile number active', 'If email is inaccessible, contact VU support', 'Change password every few months for security']
    },
    {
        id: 14, title: 'Apply for Degree/Transcript', icon: '🎓',
        steps: ['Ensure you have completed credit hours and requirements', 'Go to "Student Services" -> "Apply for Degree"', 'Choose "Regular" or "Urgent"', 'Upload CNIC and Picture', 'Submit request', 'Pay the Degree Fee'],
        tips: ['Clear all dues before applying', 'Check name spelling carefully', 'Urgent degree takes ~2 weeks', 'Convocation registration is separate']
    },
    {
        id: 15, title: 'Overseas Examination', icon: '✈️',
        steps: ['Overseas students take exams Online', 'Install required Proctoring software (VUP)', 'Ensure webcam and microphone are working', 'Login to Exam software at your scheduled time', 'Proctor monitors you remotely'],
        tips: ['Stable internet is critical', 'Room must be private and well-lit', 'No headphones or extra gadgets allowed', 'Time zone difference must be noted']
    }
];
