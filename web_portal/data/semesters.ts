export interface SemesterGroup {
    semester: string;
    subjects: string[];
}

export const semesterWiseSubjects: SemesterGroup[] = [
    {
        semester: "1st Semester",
        subjects: ["CS101", "ENG101", "MTH101", "PAK301", "ISL201", "CS001", "MGT101", "PSY101"]
    },
    {
        semester: "2nd Semester",
        subjects: ["CS201", "ENG201", "MTH202", "PHY101", "MGT211", "ECO401", "CS202", "CS302"]
    },
    {
        semester: "3rd Semester",
        subjects: ["CS301", "MTH301", "STA301", "CS304", "CS403", "CS402", "MCM301", "MGMT611"]
    },
    {
        semester: "4th Semester",
        subjects: ["CS401", "CS501", "CS504", "CS601", "MGT301", "MGT503", "ENG301", "MTH401"]
    },
    {
        semester: "5th Semester",
        subjects: ["CS502", "CS506", "CS604", "CS605", "CS609", "MGT501", "MGT401", "FIN623"]
    },
    {
        semester: "6th Semester",
        subjects: ["CS602", "CS607", "CS610", "CS614", "CS615", "MGMT625", "HRM624", "MKT501"]
    },
    {
        semester: "7th Semester",
        subjects: ["CS619", "CS603", "CS606", "CS611", "MGMT627", "FIN611", "ENG501", "EDU401"]
    },
    {
        semester: "8th Semester",
        subjects: ["CS620", "CS625", "CS627", "MGMT630", "FIN624", "ENG502", "EDU501", "ZOO507"]
    },
    {
        semester: "Others",
        subjects: ["ACC311", "ACC501", "BNK601", "BT101", "CHE201", "ETH100", "GSC101", "SOC101", "STA630", "URD101"]
    }
];

export const allSemesters = semesterWiseSubjects.map(s => s.semester);
