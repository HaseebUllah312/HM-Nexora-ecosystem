export interface MCQ {
    id: number;
    subject: string;
    type: 'midterm' | 'final';
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    topic: string;
}

export const mcqs: MCQ[] = [
    { id: 1, subject: 'CS101', type: 'midterm', question: 'Which of the following is NOT an input device?', options: ['Keyboard', 'Mouse', 'Monitor', 'Scanner'], correct: 2, explanation: 'Monitor is an output device that displays visual information.', topic: 'Hardware' },
    { id: 2, subject: 'CS101', type: 'midterm', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Central Program Utility', 'Computer Personal Unit', 'Central Peripheral Unit'], correct: 0, explanation: 'CPU stands for Central Processing Unit - the brain of the computer.', topic: 'Hardware' },
    { id: 3, subject: 'CS101', type: 'midterm', question: 'Which generation of computers used transistors?', options: ['First', 'Second', 'Third', 'Fourth'], correct: 1, explanation: 'Second generation computers (1956-1963) used transistors instead of vacuum tubes.', topic: 'Computer Generations' },
    { id: 4, subject: 'CS101', type: 'final', question: 'What is the binary equivalent of decimal 10?', options: ['1010', '1001', '1100', '1110'], correct: 0, explanation: '10 in binary is 1010 (8+0+2+0).', topic: 'Number Systems' },
    { id: 5, subject: 'CS101', type: 'final', question: 'Which of the following is a high-level programming language?', options: ['Machine Language', 'Assembly Language', 'Python', 'Binary Code'], correct: 2, explanation: 'Python is a high-level programming language that is closer to human language.', topic: 'Programming Languages' },
    { id: 6, subject: 'CS201', type: 'midterm', question: 'Which operator is used for assignment in C++?', options: ['==', '=', ':=', '->'], correct: 1, explanation: 'The = operator is used for assignment in C++. == is for comparison.', topic: 'Operators' },
    { id: 7, subject: 'CS201', type: 'midterm', question: 'What is the output of: cout << 5/2;', options: ['2.5', '2', '3', 'Error'], correct: 1, explanation: 'Integer division in C++ truncates the decimal part. 5/2 = 2.', topic: 'Data Types' },
    { id: 8, subject: 'CS201', type: 'final', question: 'Which loop checks condition after execution?', options: ['for', 'while', 'do-while', 'foreach'], correct: 2, explanation: 'do-while loop executes the body first, then checks the condition.', topic: 'Loops' },
    { id: 9, subject: 'CS301', type: 'midterm', question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correct: 1, explanation: 'Stack follows Last In First Out (LIFO) principle.', topic: 'Stack' },
    { id: 10, subject: 'CS301', type: 'midterm', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, explanation: 'Binary search divides the array in half each time, giving O(log n).', topic: 'Searching' },
    { id: 11, subject: 'CS301', type: 'final', question: 'Which traversal visits root first?', options: ['Inorder', 'Preorder', 'Postorder', 'Level order'], correct: 1, explanation: 'Preorder traversal visits: Root → Left → Right.', topic: 'Trees' },
    { id: 12, subject: 'CS403', type: 'midterm', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'], correct: 0, explanation: 'SQL stands for Structured Query Language.', topic: 'SQL Basics' },
    { id: 13, subject: 'CS403', type: 'midterm', question: 'Which normal form eliminates partial dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 1, explanation: 'Second Normal Form (2NF) removes partial dependencies.', topic: 'Normalization' },
    { id: 14, subject: 'CS403', type: 'final', question: 'Which SQL command is used to remove a table?', options: ['DELETE', 'REMOVE', 'DROP', 'TRUNCATE'], correct: 2, explanation: 'DROP TABLE removes the entire table structure and data.', topic: 'DDL Commands' },
    { id: 15, subject: 'MGT201', type: 'midterm', question: 'What is the time value of money concept?', options: ['Money grows over time', 'A dollar today is worth more than a dollar tomorrow', 'Interest rates are constant', 'Inflation is zero'], correct: 1, explanation: 'Time value of money means money available now is worth more than the same amount in the future.', topic: 'TVM' },
    { id: 16, subject: 'MGT201', type: 'final', question: 'NPV stands for?', options: ['Net Profit Value', 'Net Present Value', 'New Present Value', 'Net Price Value'], correct: 1, explanation: 'NPV is Net Present Value - the difference between present value of cash inflows and outflows.', topic: 'Capital Budgeting' },
    { id: 17, subject: 'ENG101', type: 'midterm', question: 'Which is a correct sentence?', options: ['He go to school', 'He goes to school', 'He going to school', 'He gone to school'], correct: 1, explanation: 'Third person singular present tense requires "goes".', topic: 'Grammar' },
    { id: 18, subject: 'ENG101', type: 'final', question: 'What is a thesis statement?', options: ['First sentence of essay', 'Main argument of the essay', 'Last paragraph', 'A question'], correct: 1, explanation: 'A thesis statement presents the main argument or claim of an essay.', topic: 'Essay Writing' },
    { id: 19, subject: 'STA301', type: 'midterm', question: 'Mean of 2, 4, 6, 8, 10 is?', options: ['5', '6', '7', '8'], correct: 1, explanation: 'Mean = (2+4+6+8+10)/5 = 30/5 = 6', topic: 'Measures of Central Tendency' },
    { id: 20, subject: 'STA301', type: 'final', question: 'In normal distribution, what percentage falls within 1 standard deviation?', options: ['50%', '68%', '95%', '99%'], correct: 1, explanation: 'In a normal distribution, approximately 68% of data falls within ±1 standard deviation.', topic: 'Normal Distribution' },
    { id: 21, subject: 'PAK301', type: 'midterm', question: 'When was Pakistan Resolution passed?', options: ['1930', '1935', '1940', '1947'], correct: 2, explanation: 'The Pakistan Resolution (Lahore Resolution) was passed on March 23, 1940.', topic: 'Pakistan Movement' },
    { id: 22, subject: 'PAK301', type: 'final', question: 'Who was the first Prime Minister of Pakistan?', options: ['Quaid-e-Azam', 'Liaquat Ali Khan', 'Khawaja Nazimuddin', 'Allama Iqbal'], correct: 1, explanation: 'Liaquat Ali Khan was the first PM of Pakistan (1947-1951).', topic: 'Political History' },
    { id: 23, subject: 'ISL201', type: 'midterm', question: 'How many Surahs are in the Holy Quran?', options: ['110', '112', '114', '116'], correct: 2, explanation: 'The Holy Quran contains 114 Surahs.', topic: 'Quran' },
    { id: 24, subject: 'ISL201', type: 'final', question: 'How many pillars of Islam are there?', options: ['3', '4', '5', '6'], correct: 2, explanation: 'There are 5 pillars of Islam: Shahada, Salat, Zakat, Sawm, Hajj.', topic: 'Pillars of Islam' },
    { id: 25, subject: 'CS304', type: 'midterm', question: 'Which OOP concept hides internal details?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correct: 2, explanation: 'Encapsulation hides internal state and requires all interaction through methods.', topic: 'OOP Concepts' },
    { id: 26, subject: 'CS304', type: 'final', question: 'Which keyword is used for inheritance in C++?', options: ['extends', 'inherits', ':', 'implements'], correct: 2, explanation: 'In C++, the colon (:) operator is used to define inheritance.', topic: 'Inheritance' },
    { id: 27, subject: 'CS504', type: 'midterm', question: 'Which SDLC model is also called classic life cycle?', options: ['Agile', 'Waterfall', 'Spiral', 'RAD'], correct: 1, explanation: 'Waterfall model is also known as the classic life cycle model.', topic: 'SDLC Models' },
    { id: 28, subject: 'CS504', type: 'final', question: 'What is black box testing?', options: ['Testing internal code', 'Testing without code knowledge', 'Testing hardware', 'Testing APIs only'], correct: 1, explanation: 'Black box testing tests functionality without knowledge of internal code structure.', topic: 'Testing' },
    { id: 29, subject: 'CS610', type: 'midterm', question: 'How many layers are in the OSI model?', options: ['5', '6', '7', '8'], correct: 2, explanation: 'OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', topic: 'OSI Model' },
    { id: 30, subject: 'CS610', type: 'final', question: 'Which protocol is used for email?', options: ['HTTP', 'FTP', 'SMTP', 'TCP'], correct: 2, explanation: 'SMTP (Simple Mail Transfer Protocol) is used for sending emails.', topic: 'Protocols' },
];

export function getMCQsBySubject(subject: string, type?: 'midterm' | 'final'): MCQ[] {
    let filtered = mcqs.filter(m => m.subject === subject);
    if (type) filtered = filtered.filter(m => m.type === type);
    return filtered;
}

export function getRandomMCQs(subject: string, type: 'midterm' | 'final', count: number): MCQ[] {
    const available = getMCQsBySubject(subject, type);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
