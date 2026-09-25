export interface StudyScheme {
    id: string;
    title: string;
    description: string;
    duration: string;
    degreeType: string;
    semesters: {
        semesterNumber: number;
        title: string;
        subjects: string[];
    }[];
}

export const studySchemes: StudyScheme[] = [
    {
        "id": "accounting-finance",
        "title": "Accounting & Finance",
        "description": "Virtual University study scheme for Accounting & Finance (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MGT503",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT101",
                    "MGT301",
                    "MGT411",
                    "MTH302",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ACC501",
                    "MGT401",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ACC101",
                    "ETH100",
                    "MGT402",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ACC311",
                    "ECO404",
                    "FIN624",
                    "MGT201",
                    "STA630"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "FIN611",
                    "MGT501",
                    "MGT610",
                    "MGTI699",
                    "MCM301",
                    "MCM601"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "FIN621",
                    "MGT611",
                    "MGT699",
                    "EDU401",
                    "EDU406",
                    "MGT404",
                    "MGT502",
                    "MGT605",
                    "MKT530"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "FIN622",
                    "MGT612",
                    "FIN623",
                    "FIN630",
                    "MGMT622",
                    "MGT601",
                    "PSY405",
                    "SOC617",
                    "ACC311",
                    "ACC501",
                    "FIN611",
                    "FIN621",
                    "FIN622",
                    "FIN623",
                    "FIN624",
                    "FIN630",
                    "MGT201",
                    "MGT401",
                    "MGT402",
                    "MGT404",
                    "MGT411",
                    "MGT501",
                    "MGT502",
                    "MGT605",
                    "MGT611",
                    "MGT699"
                ]
            }
        ]
    },
    {
        "id": "business-administration",
        "title": "Business Administration",
        "description": "Virtual University study scheme for Business Administration (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MGT503",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT101",
                    "MGT301",
                    "MGT411",
                    "MTH302",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT501",
                    "MGT611",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGT402",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "MGT520",
                    "MKT501",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ACC501",
                    "MGT502",
                    "STA630",
                    "ECO403",
                    "ECO404",
                    "MGMT627",
                    "MGT613"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "MGMT622",
                    "MGT201",
                    "MGT510",
                    "MGTI699",
                    "MCM301",
                    "MCM601"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "MGT415",
                    "MGT603",
                    "MGT699",
                    "BNK601",
                    "BNK603",
                    "EDU406",
                    "FIN621",
                    "FIN622",
                    "HRM627",
                    "HRM630",
                    "MGMT614",
                    "MGMT615",
                    "MKT530",
                    "MKT624",
                    "PSY405"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "EDU401",
                    "FIN623",
                    "FIN625",
                    "FIN625",
                    "FIN630",
                    "HRM617",
                    "HRM626",
                    "MGMT617",
                    "MGMT631",
                    "MGT401",
                    "MGT601",
                    "MGT604",
                    "MGT610",
                    "MKT621",
                    "MKT625",
                    "SOC617",
                    "ACC501",
                    "BNK601",
                    "BNK603",
                    "FIN621",
                    "FIN622",
                    "FIN623",
                    "FIN625",
                    "FIN630",
                    "HRM627",
                    "MGMT627",
                    "MGT201",
                    "MGT401",
                    "MGT402",
                    "MGT411",
                    "MGT501",
                    "MGT502",
                    "MGT510",
                    "MGT520",
                    "MGT603",
                    "MGT604",
                    "MGT611",
                    "MGT613",
                    "MKT501",
                    "MKT621",
                    "MKT624"
                ]
            }
        ]
    },
    {
        "id": "commerce",
        "title": "Commerce",
        "description": "Virtual University study scheme for Commerce (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MGT503",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT101",
                    "MGT301",
                    "MGT411",
                    "MTH302",
                    "PAK302"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ACC311",
                    "MGT611",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGT402",
                    "MGT602",
                    "BIO101",
                    "FIN623",
                    "GSC101",
                    "MGT520",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ACC501",
                    "MGT501",
                    "MKT501",
                    "STA630",
                    "ECO403",
                    "ECO404"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "MGT201",
                    "MGT612",
                    "MGT613",
                    "MGTI699",
                    "PSY405",
                    "SOC617"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "BNK603",
                    "FIN624",
                    "MGMT614",
                    "MGT699",
                    "ECO501",
                    "EDU406",
                    "MGT404",
                    "MGT605"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "BNK612",
                    "MGMT615",
                    "MGT302",
                    "STA302",
                    "MCM301",
                    "MCM601",
                    "ACC501",
                    "BNK603",
                    "FIN623",
                    "MGT201",
                    "MGT402",
                    "MGT404",
                    "MGT411",
                    "MGT501",
                    "MGT520",
                    "MGT605",
                    "MGT611",
                    "MGT613",
                    "MKT501"
                ]
            }
        ]
    },
    {
        "id": "computer-science",
        "title": "Computer Science",
        "description": "Virtual University study scheme for Computer Science (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MTH101",
                    "MTH202",
                    "PHY101",
                    "MTH100",
                    "PAK301",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "CS302",
                    "ENG201",
                    "STA301",
                    "MTH104",
                    "PAK522",
                    "ETH202",
                    "ISL202",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS304",
                    "CS601",
                    "MCM301",
                    "MTH401",
                    "CS301P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS401",
                    "CS403",
                    "CS504",
                    "MGT602",
                    "MTH501",
                    "CS525",
                    "CS403P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "CS306",
                    "CS402",
                    "CS502",
                    "CS604",
                    "CSI619",
                    "MTH603",
                    "CS202",
                    "CS605",
                    "CS610"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "CS411",
                    "CS501",
                    "CS602",
                    "CS607",
                    "CS314",
                    "CS405",
                    "CS603"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "CS619",
                    "CS515",
                    "CS609",
                    "CS621",
                    "ECO401",
                    "MGT502",
                    "MGT610"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "CS619",
                    "CS205",
                    "CS606",
                    "CS311",
                    "CS407",
                    "CS408",
                    "CS435",
                    "CS506",
                    "CS611",
                    "CS614",
                    "CS301",
                    "CS304",
                    "CS401",
                    "CS403",
                    "CS411",
                    "CS501",
                    "CS502",
                    "CS504",
                    "CS506",
                    "CS601",
                    "CS602",
                    "CS604",
                    "CS605",
                    "CS606",
                    "CS607",
                    "CS609",
                    "CS610",
                    "CS614",
                    "CS621",
                    "ENG201",
                    "MCM301",
                    "MTH401",
                    "MTH603"
                ]
            }
        ]
    },
    {
        "id": "information-technology",
        "title": "Information Technology",
        "description": "Virtual University study scheme for Information Technology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MTH101",
                    "MTH202",
                    "PHY101",
                    "MTH100",
                    "PAK301",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "ENG201",
                    "MCM301",
                    "STA301",
                    "MTH104",
                    "PAK522",
                    "ETH202",
                    "ISL202",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS302",
                    "CS304",
                    "CS403",
                    "MGT602",
                    "MTH501",
                    "CS304P",
                    "CS403P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS301",
                    "CS401",
                    "CS504",
                    "CS601",
                    "MTH401",
                    "CS525",
                    "CS301P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "CS306",
                    "CS402",
                    "CS409",
                    "CS502",
                    "CS604",
                    "CS610",
                    "CSI619"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "CS205",
                    "CS435",
                    "CS511",
                    "CS521",
                    "CS607",
                    "IT601"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "CS619",
                    "CS627",
                    "IT602",
                    "CS314",
                    "CS315",
                    "CS407",
                    "CS505",
                    "CS642"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "CS619",
                    "CS621",
                    "MTH603",
                    "ECO401",
                    "MGT502",
                    "MGT610",
                    "CS301",
                    "CS304",
                    "CS314",
                    "CS315",
                    "CS401",
                    "CS403",
                    "CS407",
                    "CS409",
                    "CS502",
                    "CS505",
                    "CS601",
                    "CS604",
                    "CS610",
                    "ENG201",
                    "IT601",
                    "MCM301",
                    "MTH401",
                    "MTH501"
                ]
            }
        ]
    },
    {
        "id": "mass-communication",
        "title": "Mass Communication",
        "description": "Virtual University study scheme for Mass Communication (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MCM101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ETH100",
                    "MCM301",
                    "MCM304",
                    "STA301",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MCM310",
                    "MCM311",
                    "MCM401",
                    "MGT602",
                    "URD101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "GSC101",
                    "MCM411",
                    "MCM501",
                    "MCM511",
                    "MCM610"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "MCM514",
                    "MCM601",
                    "PSC401",
                    "EDU403",
                    "MGT211",
                    "MGT301",
                    "SOC401"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "MCM515",
                    "MCM532",
                    "MCMI619",
                    "STA630",
                    "CS204",
                    "IT430",
                    "MGT502",
                    "MGT503"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "MCM431",
                    "MCM516",
                    "MCM517",
                    "MCM520",
                    "PSC201",
                    "MCM512"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "MCM499",
                    "MCM531",
                    "MCM604",
                    "MCM611",
                    "SOC610"
                ]
            }
        ]
    },
    {
        "id": "psychology",
        "title": "Psychology",
        "description": "Virtual University study scheme for Psychology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "PSY101",
                    "PSY502",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MTH302",
                    "PSY404",
                    "PSY405",
                    "PSY512",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU403",
                    "PSY403",
                    "PSY504",
                    "STA641",
                    "PSC201",
                    "SOC101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BIO101",
                    "ETH100",
                    "MGT602",
                    "PSY505",
                    "PSY515",
                    "PSY611"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "PSYP631",
                    "PSY401",
                    "PSY516",
                    "STA630",
                    "MCM101",
                    "MCM304"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "PSYP610",
                    "PSY406",
                    "PSY632",
                    "SOC609",
                    "SOC301",
                    "SOC401"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "PSY407",
                    "PSY408",
                    "PSY409",
                    "PSYI619",
                    "PSYP402",
                    "MCM301",
                    "SOC404"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "PSY499",
                    "PSY511",
                    "PSY513",
                    "ECO401",
                    "MGT211",
                    "PSY510",
                    "PSY514"
                ]
            }
        ]
    },
    {
        "id": "public-administration",
        "title": "Public Administration",
        "description": "Virtual University study scheme for Public Administration (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT503",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT101",
                    "MGT111",
                    "MGT522",
                    "MTH100",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT301",
                    "MGT411",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MGT501",
                    "MGT611",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGT602",
                    "ACC501",
                    "BIO101",
                    "GSC101",
                    "MCM401",
                    "MGT502",
                    "MGT513",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "PAD603",
                    "SOC401",
                    "SOC404",
                    "STA630",
                    "ECO403",
                    "ECO622"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "MGT621",
                    "PADI699",
                    "ECO404",
                    "ECO610",
                    "PSY405",
                    "SOC607",
                    "SOC612"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "PAD699",
                    "SOC613",
                    "SOC615",
                    "SOC617",
                    "EDU406",
                    "MCM301"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "MGT603",
                    "SOC601",
                    "SOC605",
                    "SOC616",
                    "MCM517",
                    "MCM601",
                    "MGT501",
                    "MGT502",
                    "MGT513",
                    "MGT522",
                    "MGT603",
                    "MGT621",
                    "PAD603"
                ]
            }
        ]
    },
    {
        "id": "ms-in-computer-science",
        "title": "MS in Computer Science",
        "description": "Virtual University study scheme for MS in Computer Science (2 Years).",
        "duration": "2 Years",
        "degreeType": "MS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS701",
                    "CS702",
                    "CS708",
                    "CS712",
                    "CS716"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS703",
                    "CS719",
                    "CS706",
                    "CS718",
                    "CS726"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS704",
                    "CS720",
                    "CS707",
                    "CS709",
                    "CS710",
                    "CS711",
                    "CS713",
                    "CS721",
                    "CS723",
                    "CS724",
                    "CS725"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS720"
                ]
            }
        ]
    },
    {
        "id": "bachelor-of-business-information-technology-bbit",
        "title": "Bachelor of Business & Information Technology (BBIT)",
        "description": "Virtual University study scheme for Bachelor of Business & Information Technology (BBIT) (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MGT503",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "ENG201",
                    "MGT301",
                    "MTH302",
                    "PHY101",
                    "PAK301",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS302",
                    "CS304",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "CS302P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS403",
                    "ETH100",
                    "MGT101",
                    "MGT501",
                    "MGT602",
                    "PAK522",
                    "CS403P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ACC501",
                    "CS301",
                    "CS504",
                    "CS601",
                    "EDU401",
                    "MCM301",
                    "CS301P"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "CS605",
                    "MGT411",
                    "MGTI699",
                    "ECO404",
                    "MGT502",
                    "MKT501",
                    "MKT530",
                    "MKT621",
                    "SOC617"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "CS610",
                    "IT430",
                    "MGT699",
                    "CS310",
                    "CS615",
                    "MCM601",
                    "PSY405",
                    "CS610P"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "CS614",
                    "MGT611",
                    "CS407",
                    "CS408",
                    "EDU406",
                    "MGMT614",
                    "MGT402",
                    "SOC404",
                    "ACC501",
                    "CS201",
                    "CS302",
                    "CS304",
                    "CS403",
                    "CS408",
                    "CS504",
                    "CS601",
                    "CS605",
                    "CS610",
                    "CS614",
                    "CS615",
                    "ENG201",
                    "IT430",
                    "MGT402",
                    "MGT501",
                    "MGT502",
                    "MGT611",
                    "STA301"
                ]
            }
        ]
    },
    {
        "id": "b-ed-hons-elementary",
        "title": "B.Ed. (Hons) Elementary",
        "description": "Virtual University study scheme for B.Ed. (Hons) Elementary (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "EDU101",
                    "ENG101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU301",
                    "EDU305",
                    "ENG201",
                    "GSC101",
                    "SOC201",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU405",
                    "EDU430",
                    "EDU516",
                    "MGT602",
                    "PAK522",
                    "URD100"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU403",
                    "EDU501",
                    "EDU510",
                    "ETH100",
                    "GSC201",
                    "TPTA519"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "EDU303",
                    "EDU410",
                    "EDU411",
                    "EDU431",
                    "PSY406",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "EDU304",
                    "EDU401",
                    "EDU512",
                    "EDU601",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "EDU402",
                    "EDU406",
                    "EDU407",
                    "EDU433",
                    "EDU515",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "EDU602",
                    "EDU604",
                    "EDUA630",
                    "TPTB519",
                    "MCM101",
                    "MCM301",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            }
        ]
    },
    {
        "id": "software-engineering",
        "title": "Software Engineering",
        "description": "Virtual University study scheme for Software Engineering (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "CS201",
                    "ENG101",
                    "MTH101",
                    "MTH202",
                    "MTH100",
                    "CS201P",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS302",
                    "CS304",
                    "CS403",
                    "STA301",
                    "MTH104",
                    "PAK301",
                    "CS304P",
                    "CS403P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS401",
                    "CS504",
                    "MCM301",
                    "CS525",
                    "PAK522",
                    "CS301P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS510",
                    "CS603",
                    "ENG201",
                    "MGT602",
                    "PHY101",
                    "PHY301",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "CS306",
                    "CS601",
                    "CS604",
                    "CS607",
                    "CS608",
                    "CSI619",
                    "SE601",
                    "SE601P"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "CS442",
                    "CS511",
                    "CS611",
                    "CS615",
                    "CS408",
                    "CS605",
                    "CS614",
                    "SE602"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "CS619",
                    "CS205",
                    "CS502",
                    "MTH401",
                    "MTH501",
                    "CS402",
                    "CS609"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "CS619",
                    "CS621",
                    "MTH603",
                    "ECO401",
                    "MGT502",
                    "MGT610",
                    "CS301",
                    "CS304",
                    "CS401",
                    "CS403",
                    "CS408",
                    "CS504",
                    "CS510",
                    "CS511",
                    "CS601",
                    "CS603",
                    "CS604",
                    "CS605",
                    "CS609",
                    "CS611",
                    "CS614",
                    "CS615",
                    "ENG201",
                    "MCM301",
                    "SE601"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-computer-networking",
        "title": "Associate Degree in Computer Networking",
        "description": "Virtual University study scheme for Associate Degree in Computer Networking (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT602",
                    "MTH101",
                    "MTH100",
                    "PAK301",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "CS302",
                    "CS601",
                    "ENG201",
                    "MTH202",
                    "MTH501",
                    "MTH104",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS304",
                    "CS607",
                    "CS610",
                    "CS314",
                    "CS431",
                    "CS301P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS205",
                    "CS403",
                    "CS504",
                    "CS519",
                    "CS315",
                    "CS432",
                    "CS435",
                    "CS627",
                    "CS642",
                    "CS403P",
                    "CS301",
                    "CS315",
                    "CS431",
                    "CS432",
                    "CS610"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-database-management-system",
        "title": "Associate Degree in Database Management System",
        "description": "Virtual University study scheme for Associate Degree in Database Management System (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT602",
                    "MTH101",
                    "MTH100",
                    "PAK301",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "CS302",
                    "CS601",
                    "ENG201",
                    "MTH202",
                    "MTH501",
                    "MTH104",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS304",
                    "CS306",
                    "CS607",
                    "CS311",
                    "CS411",
                    "CS420",
                    "CS301P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS205",
                    "CS403",
                    "CS504",
                    "CS519",
                    "CS202",
                    "CS405",
                    "CS409",
                    "CS441",
                    "CS506",
                    "CS511",
                    "CS403P",
                    "CS301",
                    "CS403",
                    "CS405",
                    "CS409",
                    "CS411",
                    "CS441",
                    "CS504",
                    "ENG201"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-web-design-and-development",
        "title": "Associate Degree in Web Design and Development",
        "description": "Virtual University study scheme for Associate Degree in Web Design and Development (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT602",
                    "MTH101",
                    "MTH100",
                    "PAK301",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "CS302",
                    "CS601",
                    "ENG201",
                    "MTH202",
                    "MTH501",
                    "MTH104",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS304",
                    "CS306",
                    "CS607",
                    "CS311",
                    "CS411",
                    "CS420",
                    "CS301P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS205",
                    "CS403",
                    "CS504",
                    "CS519",
                    "CS202",
                    "CS310",
                    "CS405",
                    "CS406",
                    "CS409",
                    "CS506",
                    "CS511",
                    "CS403P",
                    "CS301",
                    "CS304",
                    "CS310",
                    "CS311",
                    "CS403",
                    "CS420",
                    "CS504",
                    "ENG201"
                ]
            }
        ]
    },
    {
        "id": "bioinformatics",
        "title": "Bioinformatics",
        "description": "Virtual University study scheme for Bioinformatics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO5105",
                    "ENG101",
                    "BIO101",
                    "BIO102",
                    "CS101",
                    "MTH100",
                    "PAK301",
                    "ETH202",
                    "ISL202",
                    "MB501P",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIO504T",
                    "BIO505T",
                    "CS201",
                    "ENG201",
                    "MTH5101",
                    "PAK522",
                    "BIO504P",
                    "BIO505P",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIF401",
                    "CS301",
                    "ENG301",
                    "MB502T",
                    "MTH303",
                    "BIF401P",
                    "CS301P",
                    "MB502P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BIF501",
                    "BIO506T",
                    "CS304",
                    "MTH202",
                    "BIF498",
                    "BT406",
                    "BIF501P",
                    "BIO506P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "BIO401",
                    "CS403",
                    "CS408",
                    "CS502",
                    "MB504P",
                    "CS403P",
                    "MB504T"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "BIF601",
                    "BIO502",
                    "BIO5101",
                    "BT505",
                    "CS504",
                    "BIF601P",
                    "BT511P"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "BIF499A",
                    "BIF602",
                    "BIO601",
                    "CS602",
                    "CS620",
                    "BT512T",
                    "BT512P"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "BIF499B",
                    "BIF604",
                    "CS607",
                    "CS614",
                    "CS607P",
                    "BIF499B"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-accounting-finance",
        "title": "Associate Degree in Accounting & Finance",
        "description": "Virtual University study scheme for Associate Degree in Accounting & Finance (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH302",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT101",
                    "MGT211",
                    "MGT301",
                    "MGT503",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ACC501",
                    "MCM301",
                    "MGT402",
                    "MGT501",
                    "MGT611",
                    "PSY101"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "FIN623",
                    "MGT401",
                    "MGT404",
                    "MGT411",
                    "FIN619",
                    "FINI619",
                    "ACC501",
                    "FIN623",
                    "MGT401",
                    "MGT402",
                    "MGT404",
                    "MGT411",
                    "MGT501",
                    "MGT611"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-islamic-banking",
        "title": "Associate Degree in Islamic Banking",
        "description": "Virtual University study scheme for Associate Degree in Islamic Banking (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BNK611",
                    "BNK613",
                    "STA301",
                    "BNK610",
                    "BNK612",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "FIN624",
                    "MGT411",
                    "MGT602",
                    "BIO101",
                    "BNK601",
                    "GSC101",
                    "MGT604",
                    "PHY101",
                    "MGT411"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-human-resource-management",
        "title": "Associate Degree in Human Resource Management",
        "description": "Virtual University study scheme for Associate Degree in Human Resource Management (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT501",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "HRM624",
                    "MGMT611",
                    "MGMT622",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "HRM613",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "HRM617",
                    "HRM626",
                    "HRM627",
                    "MGMT623",
                    "PHY101",
                    "HRM613",
                    "HRM617",
                    "HRM626"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-operations-management",
        "title": "Associate Degree in Operations Management",
        "description": "Virtual University study scheme for Associate Degree in Operations Management (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT520",
                    "MGT613",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MGMT614",
                    "MGMT615",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGMT622",
                    "MGT510",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "MGMT617",
                    "MGMT631",
                    "PHY101",
                    "MGMT614",
                    "MGT510",
                    "MGT613"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-sales-and-marketing",
        "title": "Associate Degree in Sales and Marketing",
        "description": "Virtual University study scheme for Associate Degree in Sales and Marketing (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT411",
                    "MKT627",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MKT530",
                    "MKT610",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "MGT302",
                    "MKT529",
                    "MKT621",
                    "MKT624",
                    "MKT625",
                    "MKT630",
                    "PHY101",
                    "MKT529",
                    "MKT530",
                    "MKT621",
                    "MKT627"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-supply-chain-management",
        "title": "Associate Degree in Supply Chain Management",
        "description": "Virtual University study scheme for Associate Degree in Supply Chain Management (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGMT614",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MGMT627",
                    "MGT510",
                    "MKT529",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGMT615",
                    "MGMT617",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "MGMT631",
                    "MGT613",
                    "PHY101",
                    "MGMT614",
                    "MGMT615",
                    "MGT613"
                ]
            }
        ]
    },
    {
        "id": "biotechnology",
        "title": "Biotechnology",
        "description": "Virtual University study scheme for Biotechnology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO5101",
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH100",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIO504T",
                    "BIO5105",
                    "CHE201",
                    "ENG201",
                    "MTH202",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIO505T",
                    "MB502T",
                    "MGT602",
                    "BT611T",
                    "BT614T",
                    "MIC501T",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BIO732",
                    "BT501",
                    "SOC604",
                    "BT605",
                    "BIO504P",
                    "BIO505P",
                    "BT511P",
                    "MB501P",
                    "MB502P",
                    "MIC501P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "BIO506T",
                    "BT101",
                    "BT601",
                    "CS201",
                    "BT513T",
                    "BT612T"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "BIF101",
                    "BIO401",
                    "BIO503",
                    "BT302",
                    "BT405",
                    "BT504",
                    "CS442"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "BTI619",
                    "EDU301",
                    "MCD504",
                    "BIF401P",
                    "BIO506P",
                    "BT513P",
                    "BT611P",
                    "BT612P",
                    "BT614P"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "BT619",
                    "BT401",
                    "BT503",
                    "BT505",
                    "BT613T"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-education",
        "title": "Associate Degree in Education",
        "description": "Virtual University study scheme for Associate Degree in Education (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "EDU101",
                    "ENG101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU301",
                    "EDU305",
                    "ENG201",
                    "GSC101",
                    "SOC201",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU405",
                    "EDU430",
                    "EDU516",
                    "MGT602",
                    "PAK522",
                    "URD100"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU403",
                    "EDU501",
                    "EDU510",
                    "ETH100",
                    "GSC201",
                    "TPTA519"
                ]
            }
        ]
    },
    {
        "id": "b-ed-secondary-1-5-year-program",
        "title": "B.Ed. Secondary (1.5-Year Program)",
        "description": "Virtual University study scheme for B.Ed. Secondary (1.5-Year Program) (4 Years).",
        "duration": "4 Years",
        "degreeType": "B.Ed",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "EDU301",
                    "EDU402",
                    "EDU406",
                    "EDU430",
                    "EDU601",
                    "EDU602",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU302",
                    "EDU407",
                    "EDU431",
                    "CS408",
                    "CS507",
                    "EDU201",
                    "EDU401",
                    "EDU604",
                    "MGMT623",
                    "MGTE630",
                    "PSY403",
                    "PSY511",
                    "SOC101"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "TPTG620",
                    "EDU433",
                    "EDUA630",
                    "CS625",
                    "EDU304",
                    "EDU501",
                    "EDU654",
                    "MGT502",
                    "MGT510",
                    "PSY504",
                    "SOC401"
                ]
            }
        ]
    },
    {
        "id": "sociology",
        "title": "Sociology",
        "description": "Virtual University study scheme for Sociology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "SOC101",
                    "SOC201",
                    "SOC301",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ETH100",
                    "MTH302",
                    "SOC302",
                    "SOC404",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT602",
                    "SOC401",
                    "SOC403",
                    "SOC602",
                    "URD101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "GSC101",
                    "PSY403",
                    "SOC603",
                    "SOC604",
                    "SOC605"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "MGT502",
                    "SOC402",
                    "SOC509",
                    "SOC606",
                    "MGT111",
                    "MGT522"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "SOC607",
                    "SOC608",
                    "SOC609",
                    "SOC612",
                    "SOC613",
                    "MCM101",
                    "MCM301",
                    "MCM401"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "PSY515",
                    "SOC611",
                    "SOC614",
                    "SOC615",
                    "SOC616",
                    "SOCI619"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "EDU403",
                    "SOC499",
                    "SOC601",
                    "SOC610",
                    "SOC617"
                ]
            }
        ]
    },
    {
        "id": "economics",
        "title": "Economics",
        "description": "Virtual University study scheme for Economics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO302",
                    "ENG101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ECO303",
                    "ECO402",
                    "ENG201",
                    "ETH100",
                    "STA301",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ECO403",
                    "ECO501",
                    "ECO606",
                    "EDU403",
                    "MGT602",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ECO601",
                    "ECO603",
                    "MGT411",
                    "STA630",
                    "GSC101",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ECO607",
                    "ECO610",
                    "ECO614",
                    "ENG301",
                    "HRM627",
                    "MGT211"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "ECO609",
                    "ECO613",
                    "ECO616",
                    "MTH302",
                    "STAT404"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "ECO404",
                    "ECO605",
                    "ECO608",
                    "ECO615",
                    "ECOI619"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "BNK611",
                    "ECO499",
                    "ECO604",
                    "ECO612",
                    "ECO622"
                ]
            }
        ]
    },
    {
        "id": "b-ed-elementary-2-5-year",
        "title": "B.Ed. Elementary (2.5-Year)",
        "description": "Virtual University study scheme for B.Ed. Elementary (2.5-Year) (4 Years).",
        "duration": "4 Years",
        "degreeType": "B.Ed",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "EDU101",
                    "EDU201",
                    "EDU301",
                    "EDU402",
                    "EDU405",
                    "PSY406",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS101",
                    "EDU303",
                    "EDU411",
                    "EDU512",
                    "ENG201",
                    "GSC201"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU305",
                    "EDU401",
                    "EDU410",
                    "EDU430",
                    "EDU515",
                    "EDU516"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU304",
                    "EDU403",
                    "EDU407",
                    "EDU501",
                    "EDU510",
                    "EDU604"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "EDU431",
                    "EDU602",
                    "EDUA630",
                    "TPTA519",
                    "TPTB519",
                    "TPTC519"
                ]
            }
        ]
    },
    {
        "id": "mathematics",
        "title": "Mathematics",
        "description": "Virtual University study scheme for Mathematics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MTH104",
                    "MTH5101",
                    "MTH100",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS306",
                    "ENG201",
                    "GSC101",
                    "MTH302",
                    "MTH5102",
                    "PAK301",
                    "CS306P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT602",
                    "MTH5204",
                    "MTH5205",
                    "MTH5206",
                    "MTH5207",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ENG301",
                    "MTH5208",
                    "MTH5209",
                    "MTH5210",
                    "MTH5211",
                    "SOC101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "MCD504",
                    "MTH603",
                    "MTH621",
                    "MTH643",
                    "MTH646"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "EDU510",
                    "MTH601",
                    "MTH631",
                    "MTH634",
                    "MTH641"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "BIF401",
                    "MTH600A",
                    "MTH622",
                    "MTH632",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "MTH600B",
                    "MTH642",
                    "MTH644",
                    "MTH645",
                    "MTH647",
                    "MTH600B"
                ]
            }
        ]
    },
    {
        "id": "english-applied-linguistics",
        "title": "English (Applied Linguistics)",
        "description": "Virtual University study scheme for English (Applied Linguistics) (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "ENG502",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ENG501",
                    "ENG522",
                    "ETH100",
                    "STA301",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU403",
                    "ENG507",
                    "ENG508",
                    "ENG509",
                    "MGT602",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ENG503",
                    "ENG504",
                    "ENG506",
                    "ENG510",
                    "BIO101",
                    "GSC101"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "EDU406",
                    "ENG505",
                    "ENG511",
                    "ENG512",
                    "ENG518"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "ENG513",
                    "ENG514",
                    "ENG515",
                    "ENG529",
                    "MGT501"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "ENG498",
                    "ENG516",
                    "ENG517",
                    "ENG523",
                    "PSY403"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "ENG499",
                    "ENG519",
                    "ENG524",
                    "ENG527",
                    "MCM304"
                ]
            }
        ]
    },
    {
        "id": "zoology",
        "title": "Zoology",
        "description": "Virtual University study scheme for Zoology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO5105",
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH100",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CHE201",
                    "ENG201",
                    "MTH202",
                    "ZOO512T",
                    "ZOO513T",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIO504T",
                    "BIO505T",
                    "MB502T",
                    "MGT602",
                    "ZOO516T",
                    "PAK522",
                    "ZOO501T"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "SOC610",
                    "ZOO510",
                    "ZOO519T",
                    "BT605",
                    "BIO504P",
                    "BIO505P",
                    "MB501P",
                    "MB502P",
                    "ZOO512P",
                    "ZOO513P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "BIO401",
                    "BT101",
                    "CS201",
                    "ZOO503",
                    "ZOO504",
                    "ZOO518T"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "BIF101",
                    "BT302",
                    "CS442",
                    "MCD504",
                    "ZOO507",
                    "ZOO511T"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "ZOOI620",
                    "EDU301",
                    "ZOO501P",
                    "ZOO511P",
                    "ZOO516P",
                    "ZOO518P",
                    "ZOO519P"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "ZOO620",
                    "ZOO517T",
                    "BT512T",
                    "MIC501T",
                    "ZOO603T"
                ]
            }
        ]
    },
    {
        "id": "b-ed-hons-early-childhood-care-and-education",
        "title": "B.Ed. (Hons.) Early Childhood Care and Education",
        "description": "Virtual University study scheme for B.Ed. (Hons.) Early Childhood Care and Education (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECE101",
                    "ENG101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU301",
                    "EDUA305",
                    "ENG201",
                    "GSC101",
                    "SOC201",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDUA405",
                    "EDUA430",
                    "EDUA516",
                    "MGT602",
                    "PAK522",
                    "URD100"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ECTA519",
                    "EDUA403",
                    "EDUA501",
                    "EDUA510",
                    "ETH100",
                    "GSCA201"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ECE201",
                    "ECE204",
                    "ECE301",
                    "EDU306",
                    "PSY406",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "ECE203",
                    "ECE302",
                    "EDU433",
                    "EDUA411",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "ECE202",
                    "ECE402",
                    "EDU407",
                    "EDUA402",
                    "EDUA601",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "ECTB519",
                    "EDUA406",
                    "EDUA602",
                    "EDUA630",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-mass-communication",
        "title": "Associate Degree in Mass Communication",
        "description": "Virtual University study scheme for Associate Degree in Mass Communication (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MCM101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ETH100",
                    "MCM301",
                    "MCM304",
                    "STA301",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MCM310",
                    "MCM311",
                    "MCM401",
                    "MGT602",
                    "URD101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "GSC101",
                    "MCM411",
                    "MCM501",
                    "MCM511",
                    "MCM610"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-psychology",
        "title": "Associate Degree in Psychology",
        "description": "Virtual University study scheme for Associate Degree in Psychology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "PSY101",
                    "PSY502",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MTH302",
                    "PSY404",
                    "PSY405",
                    "PSY512",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU403",
                    "PSY403",
                    "PSY504",
                    "STA641",
                    "PSC201",
                    "SOC101",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BIO101",
                    "ETH100",
                    "MGT602",
                    "PSY505",
                    "PSY515",
                    "PSY611"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-computer-science",
        "title": "Associate Degree in Computer Science",
        "description": "Virtual University study scheme for Associate Degree in Computer Science (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT602",
                    "MTH101",
                    "MTH100",
                    "PAK301",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "CS302",
                    "CS601",
                    "ENG201",
                    "MTH202",
                    "MTH501",
                    "MTH104",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS304",
                    "CS306",
                    "CS607",
                    "CS311",
                    "CS411",
                    "CS420",
                    "CS301P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS205",
                    "CS403",
                    "CS504",
                    "CS519",
                    "CS314",
                    "CS405",
                    "CS407",
                    "CS409",
                    "CS431",
                    "CS435",
                    "CS506",
                    "CS511",
                    "CS610",
                    "CS403P",
                    "CS301",
                    "CS304",
                    "CS403",
                    "CS504",
                    "CS610",
                    "ENG201"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-commerce",
        "title": "Associate Degree in Commerce",
        "description": "Virtual University study scheme for Associate Degree in Commerce (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK302"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ACC311",
                    "MGT411",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "FIN611",
                    "MGT611",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "IT430",
                    "MGT402",
                    "MGT602",
                    "BIO101",
                    "FIN623",
                    "GSC101",
                    "MGT520",
                    "PHY101",
                    "ACC311",
                    "FIN611",
                    "FIN623",
                    "MGT402",
                    "MGT411",
                    "MGT611"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-business-administration",
        "title": "Associate Degree in Business Administration",
        "description": "Virtual University study scheme for Associate Degree in Business Administration (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT101",
                    "MGT211",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT301",
                    "MGT503",
                    "MTH302",
                    "MCM101",
                    "PSY101",
                    "SOC101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT411",
                    "MGT501",
                    "MGT611",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGT402",
                    "MGT520",
                    "MGT602",
                    "BIO101",
                    "GSC101",
                    "MGT302",
                    "MKT501",
                    "PHY101",
                    "MGT501"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-early-childhood-care-and-education",
        "title": "Associate Degree in Early Childhood Care and Education",
        "description": "Virtual University study scheme for Associate Degree in Early Childhood Care and Education (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECE101",
                    "ENG101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU301",
                    "EDUA305",
                    "ENG201",
                    "GSC101",
                    "SOC201",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDUA405",
                    "EDUA430",
                    "EDUA516",
                    "MGT602",
                    "PAK522",
                    "URD100"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ECTA519",
                    "EDUA403",
                    "EDUA501",
                    "EDUA510",
                    "ETH100",
                    "GSCA201"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-business-administration",
        "title": "Diploma in Business Administration",
        "description": "Virtual University study scheme for Diploma in Business Administration (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "MGT101",
                    "MGT301",
                    "MGT501",
                    "MGT503",
                    "MTH302",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS507",
                    "ECO401",
                    "ENG301",
                    "IT430",
                    "MGT411",
                    "MKT501"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-accounting",
        "title": "Diploma in Accounting",
        "description": "Virtual University study scheme for Diploma in Accounting (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ACC311",
                    "ENG301",
                    "MGT101",
                    "MGT211",
                    "MGT402",
                    "MTH302",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ECO401",
                    "FIN611",
                    "FIN621",
                    "IT430",
                    "MGT401",
                    "MGT411"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-accounting-finance",
        "title": "Diploma in Accounting & Finance",
        "description": "Virtual University study scheme for Diploma in Accounting & Finance (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ACC501",
                    "CS101",
                    "ENG201",
                    "MGT101",
                    "MGT211",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "FIN630",
                    "MGT201",
                    "MGT401",
                    "MGT402",
                    "MGT411"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-banking-finance",
        "title": "Diploma in Banking & Finance",
        "description": "Virtual University study scheme for Diploma in Banking & Finance (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BNK601",
                    "CS101",
                    "ECO401",
                    "ENG201",
                    "MGT101",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BNK603",
                    "FIN621",
                    "MGT201",
                    "MGT411",
                    "MGT604"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-finance",
        "title": "Diploma in Finance",
        "description": "Virtual University study scheme for Diploma in Finance (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO401",
                    "ENG201",
                    "MGT101",
                    "MGT211",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ACC501",
                    "FIN621",
                    "FIN624",
                    "FIN630",
                    "MGT411"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-marketing-management",
        "title": "Diploma in Marketing Management",
        "description": "Virtual University study scheme for Diploma in Marketing Management (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO401",
                    "ENG201",
                    "MGT301",
                    "PSY101",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MCM401",
                    "MGT503",
                    "MKT610",
                    "MKT621",
                    "MKT624"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-entrepreneurship-sme-management",
        "title": "Diploma in Entrepreneurship & SME Management",
        "description": "Virtual University study scheme for Diploma in Entrepreneurship & SME Management (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO401",
                    "ENG201",
                    "MGT503",
                    "PSY101",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MGT101",
                    "MGT301",
                    "MGT520",
                    "MGT601",
                    "MGT602"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-public-administration",
        "title": "Diploma in Public Administration",
        "description": "Virtual University study scheme for Diploma in Public Administration (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG201",
                    "MGT111",
                    "MGT503",
                    "MGT522",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ECO401",
                    "MGMT623",
                    "MGT101",
                    "MGT502",
                    "SOC401"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-human-resource-management",
        "title": "Diploma in Human Resource Management",
        "description": "Virtual University study scheme for Diploma in Human Resource Management (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG201",
                    "HRM626",
                    "MGT501",
                    "PSY510",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "HRM617",
                    "HRM624",
                    "HRM627",
                    "MGMT611",
                    "MGMT622"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-applied-psychology",
        "title": "Diploma in Applied Psychology",
        "description": "Virtual University study scheme for Diploma in Applied Psychology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "PSY101",
                    "PSY404",
                    "PSY502",
                    "PSY631",
                    "STA630",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "PSY402",
                    "PSY403",
                    "PSY405",
                    "PSY610",
                    "PSY632"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-computer-science",
        "title": "Diploma in Computer Science",
        "description": "Virtual University study scheme for Diploma in Computer Science (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "CS201",
                    "CS302",
                    "ENG201",
                    "MTH101",
                    "CS201P",
                    "CS302P",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS202",
                    "CS301",
                    "CS304",
                    "CS403",
                    "CS601",
                    "CS301P",
                    "CS304P",
                    "CS403P",
                    "CS301",
                    "CS304",
                    "CS403"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-information-technology",
        "title": "Diploma in Information Technology",
        "description": "Virtual University study scheme for Diploma in Information Technology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "CS201",
                    "CS202",
                    "ENG201",
                    "MGT211",
                    "CS201P",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS205",
                    "CS403",
                    "CS504",
                    "CS601",
                    "IT430",
                    "CS403P",
                    "CS205",
                    "CS403",
                    "CS504"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-television-production",
        "title": "Diploma in Television Production",
        "description": "Virtual University study scheme for Diploma in Television Production (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "MCD401",
                    "MCD402",
                    "MCD501",
                    "MCD502",
                    "MCD504",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MCD620",
                    "MCD403",
                    "MCD404",
                    "MCD503"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-linguistics",
        "title": "Diploma in Linguistics",
        "description": "Virtual University study scheme for Diploma in Linguistics (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ENG501",
                    "ENG502",
                    "ENG505",
                    "ENG506",
                    "ENG507"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG508",
                    "ENG509",
                    "ENG510",
                    "ENG511",
                    "ENG512"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-molecular-biology",
        "title": "Diploma in Molecular Biology",
        "description": "Virtual University study scheme for Diploma in Molecular Biology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO505T",
                    "BIO5105",
                    "MB502T",
                    "MB504P",
                    "BIO505P",
                    "MB501P",
                    "MB502P",
                    "MB504T",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIF101",
                    "BIO504T",
                    "BIO601",
                    "BT302",
                    "BT605"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-english-language-teaching",
        "title": "Diploma in English Language Teaching",
        "description": "Virtual University study scheme for Diploma in English Language Teaching (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ENG503",
                    "ENG505",
                    "ENG506",
                    "ENG513",
                    "ENG514"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG515",
                    "ENG516",
                    "ENG517",
                    "ENG519",
                    "ENG520"
                ]
            }
        ]
    },
    {
        "id": "diploma-in-bioinformatics",
        "title": "Diploma in Bioinformatics",
        "description": "Virtual University study scheme for Diploma in Bioinformatics (2 Years).",
        "duration": "2 Years",
        "degreeType": "Diploma",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIF401",
                    "CS201",
                    "MB503T",
                    "STA301",
                    "BIF401P",
                    "CS201P",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIF501",
                    "CS403",
                    "CS441",
                    "CS620",
                    "ZOO630T",
                    "BIF501P"
                ]
            }
        ]
    },
    {
        "id": "master-of-business-administration-equivalent-to-ms",
        "title": "Master of Business Administration (Equivalent to MS)",
        "description": "Virtual University study scheme for Master of Business Administration (Equivalent to MS) (2 Years).",
        "duration": "2 Years",
        "degreeType": "MS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ECO401",
                    "MGT101",
                    "MGT301",
                    "MGT503",
                    "MTH302"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ACC501",
                    "ENG301",
                    "MGT501",
                    "MGT611",
                    "STA630"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "FIN711",
                    "MGT703",
                    "MGT713",
                    "MKT703"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "FIN703",
                    "FIN702",
                    "HRM737",
                    "MGT701",
                    "MGT725",
                    "MGT725",
                    "MGT725",
                    "MGT725",
                    "MKT726"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "MGT714",
                    "ACC707",
                    "HRM733",
                    "HRM733",
                    "MGT717",
                    "MGT717",
                    "MGT723",
                    "MKT728",
                    "MKT740"
                ]
            }
        ]
    },
    {
        "id": "data-science",
        "title": "Data Science",
        "description": "Virtual University study scheme for Data Science (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MTH101",
                    "MTH202",
                    "PHY101",
                    "MTH100",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS201",
                    "CS302",
                    "CS442",
                    "ENG201",
                    "STA301",
                    "MTH104",
                    "PAK301",
                    "CS201P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS301",
                    "CS304",
                    "CS607",
                    "MTH401",
                    "PAK522",
                    "CS301P",
                    "CS304P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS401",
                    "CS403",
                    "MCM301",
                    "MGT602",
                    "MTH501",
                    "CS525",
                    "CS403P"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "CS306",
                    "CS402",
                    "CS502",
                    "CS604",
                    "CS626",
                    "CSI619",
                    "MTH603"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "CS504",
                    "CS601",
                    "CS614",
                    "CS628",
                    "CS441",
                    "CS641"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "CS619",
                    "CS513",
                    "CS621",
                    "CS630",
                    "ECO401",
                    "MGT502",
                    "MGT610"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "CS619",
                    "CS205",
                    "CS631",
                    "STA621",
                    "STAT404"
                ]
            }
        ]
    },
    {
        "id": "islamic-studies",
        "title": "Islamic Studies",
        "description": "Virtual University study scheme for Islamic Studies (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS001",
                    "ENG101",
                    "ISL1151",
                    "MGT211",
                    "URD101",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ISL1252",
                    "ISL1253",
                    "MTH100",
                    "EDU101",
                    "PSC201",
                    "PSY101",
                    "PAK301",
                    "FHQ1101"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ISL2351",
                    "ISL2352",
                    "MGT602",
                    "SOC101",
                    "EDU433",
                    "IT430",
                    "MGT301",
                    "PAK522",
                    "FHQ1102"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU301",
                    "GSC101",
                    "ISL2453",
                    "ISL2454",
                    "MCM101",
                    "BNK612",
                    "EDU512",
                    "MCM301"
                ]
            },
            {
                "semesterNumber": 5,
                "title": "Semester 5",
                "subjects": [
                    "ISL3560",
                    "ISL3561",
                    "ISL3562",
                    "ISL3563",
                    "ISL3564"
                ]
            },
            {
                "semesterNumber": 6,
                "title": "Semester 6",
                "subjects": [
                    "ISL3665",
                    "ISL3666",
                    "ISL3667",
                    "ISL3668",
                    "ISL3669"
                ]
            },
            {
                "semesterNumber": 7,
                "title": "Semester 7",
                "subjects": [
                    "ISL4760",
                    "ISL4761",
                    "ISL4762",
                    "ISL4763",
                    "ISL4764"
                ]
            },
            {
                "semesterNumber": 8,
                "title": "Semester 8",
                "subjects": [
                    "ISL4865",
                    "ISL4869",
                    "ISL4801",
                    "ISL4802",
                    "ISL4803",
                    "ISL4804",
                    "ISL4866",
                    "ISL4867",
                    "ISL4868"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-business-analytics",
        "title": "Associate Degree in Business Analytics",
        "description": "Virtual University study scheme for Associate Degree in Business Analytics (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MTH202",
                    "MTH302",
                    "MTH100",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS306",
                    "CS442",
                    "MGT101",
                    "MGT602",
                    "STA301",
                    "MTH104",
                    "PAK301",
                    "CS306P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ENG201",
                    "GSC101",
                    "MGT415",
                    "STA302",
                    "BNK501",
                    "CS513",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ACC501",
                    "CS620",
                    "ETH100",
                    "MGMT631",
                    "STA636",
                    "MGMT614",
                    "MKT610",
                    "ACC501",
                    "MKT610"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-data-science",
        "title": "Associate Degree in Data Science",
        "description": "Virtual University study scheme for Associate Degree in Data Science (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT602",
                    "MTH202",
                    "MTH501",
                    "MTH100",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS205",
                    "CS306",
                    "CS442",
                    "ENG201",
                    "STA301",
                    "MTH104",
                    "PAK301",
                    "CS306P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS403",
                    "CS628",
                    "STA302",
                    "STA621",
                    "CS435",
                    "CS441",
                    "CS514",
                    "CS641"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS513",
                    "CS519",
                    "CS614",
                    "CS620",
                    "CS626",
                    "CS631"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-public-administration",
        "title": "Associate Degree in Public Administration",
        "description": "Virtual University study scheme for Associate Degree in Public Administration (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT503",
                    "SOC101",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "MGT101",
                    "MGT111",
                    "MGT522",
                    "MTH100",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT301",
                    "MGT411",
                    "STA301",
                    "ECO302",
                    "ECO401",
                    "ECO402",
                    "MGT501",
                    "MGT611",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ETH100",
                    "MGT602",
                    "ACC501",
                    "BIO101",
                    "GSC101",
                    "MCM401",
                    "MGT502",
                    "MGT513",
                    "PHY101"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-english-applied-linguistics",
        "title": "Associate Degree in English (Applied Linguistics)",
        "description": "Virtual University study scheme for Associate Degree in English (Applied Linguistics) (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "ENG502",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ENG501",
                    "ENG522",
                    "ETH100",
                    "STA301",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU403",
                    "ENG507",
                    "ENG508",
                    "ENG509",
                    "MGT602",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ENG503",
                    "ENG504",
                    "ENG506",
                    "ENG510",
                    "BIO101",
                    "GSC101"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-mathematics",
        "title": "Associate Degree in Mathematics",
        "description": "Virtual University study scheme for Associate Degree in Mathematics (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "MGT211",
                    "MTH104",
                    "MTH5101",
                    "MTH100",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS306",
                    "ENG201",
                    "GSC101",
                    "MTH302",
                    "MTH5102",
                    "PAK301",
                    "CS306P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT602",
                    "MTH5204",
                    "MTH5205",
                    "MTH5206",
                    "MTH5207",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ENG301",
                    "MTH5208",
                    "MTH5209",
                    "MTH5210",
                    "MTH5211",
                    "SOC101"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-zoology",
        "title": "Associate Degree in Zoology",
        "description": "Virtual University study scheme for Associate Degree in Zoology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO5105",
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH100",
                    "BIO101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CHE201",
                    "ENG201",
                    "MTH202",
                    "ZOO512T",
                    "ZOO513T",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIO504T",
                    "BIO505T",
                    "MB502T",
                    "MGT602",
                    "ZOO516T",
                    "PAK522",
                    "ZOO501T"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "SOC610",
                    "ZOO510",
                    "ZOO519T",
                    "BT605",
                    "BIO504P",
                    "BIO505P",
                    "MB501P",
                    "MB502P",
                    "ZOO512P",
                    "ZOO513P"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-biotechnology",
        "title": "Associate Degree in Biotechnology",
        "description": "Virtual University study scheme for Associate Degree in Biotechnology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO5101",
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH100",
                    "BIO101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIO504T",
                    "BIO5105",
                    "CHE201",
                    "ENG201",
                    "MTH202",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIO505T",
                    "MB502T",
                    "MGT602",
                    "BT611T",
                    "BT614T",
                    "MIC501T",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BIO732",
                    "BT501",
                    "SOC604",
                    "BT605",
                    "BIO504P",
                    "BIO505P",
                    "BT511P",
                    "MB501P",
                    "MB502P",
                    "MIC501P"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-statistics",
        "title": "Associate Degree in Statistics",
        "description": "Virtual University study scheme for Associate Degree in Statistics (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH100",
                    "STA301",
                    "MTH302",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "GSC101",
                    "MTH202",
                    "MTH5101",
                    "STA642",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MCM301",
                    "MGT211",
                    "MTH5102",
                    "PSY101",
                    "STAT404",
                    "STAT406"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS201",
                    "CS403",
                    "SOC605",
                    "STA643"
                ]
            }
        ]
    },
    {
        "id": "statistics",
        "title": "Statistics",
        "description": "Virtual University study scheme for Statistics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO401",
                    "ENG101",
                    "MTH100",
                    "STA301",
                    "MTH302",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "GSC101",
                    "MTH202",
                    "MTH5101",
                    "STA642",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MCM301",
                    "MGT211",
                    "MTH5102",
                    "PSY101",
                    "STAT404",
                    "STAT406"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS201",
                    "CS403",
                    "SOC605",
                    "STA643"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-sociology",
        "title": "Associate Degree in Sociology",
        "description": "Virtual University study scheme for Associate Degree in Sociology (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ENG101",
                    "SOC101",
                    "SOC201",
                    "SOC301",
                    "ETH202",
                    "ISL202",
                    "VU001"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG201",
                    "ETH100",
                    "MTH302",
                    "SOC302",
                    "SOC404",
                    "PAK302"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT602",
                    "SOC401",
                    "SOC403",
                    "SOC602",
                    "URD101",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "GSC101",
                    "PSY403",
                    "SOC603",
                    "SOC604",
                    "SOC605"
                ]
            }
        ]
    },
    {
        "id": "associate-degree-in-economics",
        "title": "Associate Degree in Economics",
        "description": "Virtual University study scheme for Associate Degree in Economics (2 Years).",
        "duration": "2 Years",
        "degreeType": "Associate Degree Programs",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS101",
                    "ECO302",
                    "ENG101",
                    "MTH100",
                    "SOC101",
                    "ETH202",
                    "ISL202"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ECO303",
                    "ECO402",
                    "ENG201",
                    "ETH100",
                    "STA301",
                    "PAK301"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ECO403",
                    "ECO501",
                    "ECO606",
                    "EDU403",
                    "MGT602",
                    "PAK522"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ECO601",
                    "ECO603",
                    "MGT411",
                    "STA630",
                    "GSC101",
                    "PHY101"
                ]
            }
        ]
    },
    {
        "id": "public-administration",
        "title": "Public Administration",
        "description": "Virtual University study scheme for Public Administration (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT501"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT522"
                ]
            },
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ECO403",
                    "PAD603",
                    "SOC401",
                    "SOC404",
                    "STA630"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MGT621",
                    "PADI699",
                    "ECO404",
                    "ECO610",
                    "ECO622",
                    "PSY405",
                    "SOC607",
                    "SOC612"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "PAD699",
                    "SOC613",
                    "SOC615",
                    "SOC617",
                    "EDU406",
                    "MCM301"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "MGT603",
                    "SOC601",
                    "SOC605",
                    "SOC616",
                    "MCM517",
                    "MCM601",
                    "MGT501",
                    "MGT522",
                    "MGT603",
                    "MGT621",
                    "PAD603"
                ]
            }
        ]
    },
    {
        "id": "b-ed-hons-elementary",
        "title": "B.Ed. (Hons) Elementary",
        "description": "Virtual University study scheme for B.Ed. (Hons) Elementary (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "EDU303",
                    "EDU304",
                    "EDU410",
                    "EDU411",
                    "EDU431",
                    "PSY406"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU401",
                    "EDU512",
                    "EDU601",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "EDU402",
                    "EDU406",
                    "EDU407",
                    "EDU433",
                    "EDU515",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU602",
                    "EDU604",
                    "EDUA630",
                    "TPTB519",
                    "MCM101",
                    "MCM301",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            }
        ]
    },
    {
        "id": "b-ed-hons-early-childhood-care-and-education",
        "title": "B.Ed. (Hons.) Early Childhood Care and Education",
        "description": "Virtual University study scheme for B.Ed. (Hons.) Early Childhood Care and Education (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ECE201",
                    "ECE204",
                    "ECE301",
                    "ECE402",
                    "EDU306",
                    "PSY406"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ECE203",
                    "ECE302",
                    "EDU433",
                    "EDUA411",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ECE202",
                    "EDU407",
                    "EDUA402",
                    "EDUA601",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ECTB519",
                    "EDUA406",
                    "EDUA602",
                    "EDUA630",
                    "MCM101",
                    "MCM301",
                    "MGT503",
                    "MGTE630",
                    "PSC201",
                    "PSY101",
                    "SOC301",
                    "SOC602",
                    "SOC604"
                ]
            }
        ]
    },
    {
        "id": "psychology",
        "title": "Psychology",
        "description": "Virtual University study scheme for Psychology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "PSYP631",
                    "PSY401",
                    "PSY516",
                    "STA630",
                    "MCM101",
                    "MCM304"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "PSYP610",
                    "PSY406",
                    "PSY632",
                    "SOC609",
                    "SOC301",
                    "SOC401"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "PSY407",
                    "PSY408",
                    "PSY409",
                    "PSYI619",
                    "PSYP402",
                    "MCM301",
                    "SOC404"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "PSY499",
                    "PSY511",
                    "PSY513",
                    "ECO401",
                    "MGT211",
                    "PSY510",
                    "PSY514"
                ]
            }
        ]
    },
    {
        "id": "english-applied-linguistics",
        "title": "English (Applied Linguistics)",
        "description": "Virtual University study scheme for English (Applied Linguistics) (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "EDU406",
                    "ENG505",
                    "ENG511",
                    "ENG512",
                    "ENG518"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ENG513",
                    "ENG514",
                    "ENG515",
                    "ENG529",
                    "MGT501"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ENG498",
                    "ENG516",
                    "ENG517",
                    "ENG523",
                    "PSY403"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ENG499",
                    "ENG519",
                    "ENG524",
                    "ENG527",
                    "MCM304"
                ]
            }
        ]
    },
    {
        "id": "mathematics",
        "title": "Mathematics",
        "description": "Virtual University study scheme for Mathematics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "MCD504",
                    "MTH603",
                    "MTH621",
                    "MTH643",
                    "MTH646"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "EDU510",
                    "MTH601",
                    "MTH631",
                    "MTH634",
                    "MTH641"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIF401",
                    "MTH600A",
                    "MTH622",
                    "MTH632",
                    "PHY101"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "MTH600B",
                    "MTH642",
                    "MTH644",
                    "MTH645",
                    "MTH647",
                    "MTH600B"
                ]
            }
        ]
    },
    {
        "id": "mass-communication",
        "title": "Mass Communication",
        "description": "Virtual University study scheme for Mass Communication (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "MCM514",
                    "MCM601",
                    "PSC401",
                    "EDU403",
                    "MGT211",
                    "MGT301",
                    "SOC401"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MCM515",
                    "MCM532",
                    "MCMI619",
                    "STA630",
                    "CS204",
                    "IT430",
                    "MGT502",
                    "MGT503"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MCM431",
                    "MCM516",
                    "MCM517",
                    "MCM520",
                    "PSC201",
                    "MCM512"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "MCM499",
                    "MCM531",
                    "MCM604",
                    "MCM611",
                    "SOC610"
                ]
            }
        ]
    },
    {
        "id": "sociology",
        "title": "Sociology",
        "description": "Virtual University study scheme for Sociology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "MGT502",
                    "SOC402",
                    "SOC509",
                    "SOC606",
                    "MGT111",
                    "MGT522"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "SOC607",
                    "SOC608",
                    "SOC609",
                    "SOC612",
                    "SOC613",
                    "MCM101",
                    "MCM301",
                    "MCM401"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "PSY515",
                    "SOC611",
                    "SOC614",
                    "SOC615",
                    "SOC616",
                    "SOCI619"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU403",
                    "SOC499",
                    "SOC601",
                    "SOC610",
                    "SOC617"
                ]
            }
        ]
    },
    {
        "id": "economics",
        "title": "Economics",
        "description": "Virtual University study scheme for Economics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ECO607",
                    "ECO610",
                    "ECO614",
                    "ENG301",
                    "HRM627",
                    "MGT211"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "ECO609",
                    "ECO613",
                    "ECO616",
                    "MTH302",
                    "STAT404"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ECO404",
                    "ECO605",
                    "ECO608",
                    "ECO615",
                    "ECOI619"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BNK611",
                    "ECO499",
                    "ECO604",
                    "ECO612",
                    "ECO622"
                ]
            }
        ]
    },
    {
        "id": "computer-science",
        "title": "Computer Science",
        "description": "Virtual University study scheme for Computer Science (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS306",
                    "CS402",
                    "CS502",
                    "CS604",
                    "CS610",
                    "CSI619",
                    "MTH603"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS411",
                    "CS501",
                    "CS602",
                    "CS607",
                    "CS314",
                    "CS405",
                    "CS603"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS619",
                    "CS515",
                    "CS609",
                    "CS621",
                    "ECO401",
                    "MGT502",
                    "MGT610"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS619",
                    "CS205",
                    "CS606",
                    "CS311",
                    "CS407",
                    "CS408",
                    "CS435",
                    "CS506",
                    "CS611",
                    "CS614",
                    "CS411",
                    "CS501",
                    "CS502",
                    "CS506",
                    "CS602",
                    "CS604",
                    "CS606",
                    "CS607",
                    "CS609",
                    "CS610",
                    "CS614",
                    "CS621",
                    "MTH603"
                ]
            }
        ]
    },
    {
        "id": "information-technology",
        "title": "Information Technology",
        "description": "Virtual University study scheme for Information Technology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS306",
                    "CS402",
                    "CS409",
                    "CS502",
                    "CS604",
                    "CS610",
                    "CSI619"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS205",
                    "CS435",
                    "CS511",
                    "CS521",
                    "CS607",
                    "IT601"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS619",
                    "CS627",
                    "IT602",
                    "CS314",
                    "CS315",
                    "CS407",
                    "CS505"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS619",
                    "CS621",
                    "MTH603",
                    "ECO401",
                    "MGT502",
                    "MGT610",
                    "CS314",
                    "CS315",
                    "CS407",
                    "CS409",
                    "CS502",
                    "CS505",
                    "CS604",
                    "CS610",
                    "IT601"
                ]
            }
        ]
    },
    {
        "id": "software-engineering",
        "title": "Software Engineering",
        "description": "Virtual University study scheme for Software Engineering (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS306",
                    "CS601",
                    "CS604",
                    "CS607",
                    "CS608",
                    "CSI619",
                    "SE601",
                    "SE601P"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS442",
                    "CS511",
                    "CS611",
                    "CS615",
                    "CS408",
                    "CS605",
                    "CS614",
                    "SE602"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS619",
                    "CS205",
                    "CS502",
                    "MTH401",
                    "MTH501",
                    "CS402",
                    "CS609"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS619",
                    "CS621",
                    "MTH603",
                    "ECO401",
                    "MGT502",
                    "MGT610",
                    "CS408",
                    "CS511",
                    "CS601",
                    "CS604",
                    "CS605",
                    "CS609",
                    "CS611",
                    "CS614",
                    "CS615",
                    "SE601"
                ]
            }
        ]
    },
    {
        "id": "biotechnology",
        "title": "Biotechnology",
        "description": "Virtual University study scheme for Biotechnology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO506T",
                    "BT101",
                    "BT601",
                    "CS201",
                    "BT513T",
                    "BT612T"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIF101",
                    "BIO401",
                    "BIO503",
                    "BT302",
                    "BT405",
                    "BT504",
                    "CS442"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BTI619",
                    "EDU301",
                    "MCD504",
                    "BIF401P",
                    "BIO506P",
                    "BT513P",
                    "BT611P",
                    "BT612P",
                    "BT614P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BT619",
                    "BT401",
                    "BT503",
                    "BT505",
                    "BT613T"
                ]
            }
        ]
    },
    {
        "id": "bioinformatics",
        "title": "Bioinformatics",
        "description": "Virtual University study scheme for Bioinformatics (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO401",
                    "CS403",
                    "CS408",
                    "CS502",
                    "MB504P",
                    "CS403P",
                    "MB504T"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIF601",
                    "BIO502",
                    "BIO5101",
                    "BT505",
                    "CS504",
                    "BIF601P",
                    "BT511P"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BIF499A",
                    "BIF602",
                    "BIO601",
                    "CS602",
                    "CS620",
                    "BT512T",
                    "BT512P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BIF499B",
                    "BIF604",
                    "CS607",
                    "CS614",
                    "CS607P",
                    "BIF499B"
                ]
            }
        ]
    },
    {
        "id": "zoology",
        "title": "Zoology",
        "description": "Virtual University study scheme for Zoology (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "BIO401",
                    "BT101",
                    "CS201",
                    "ZOO503",
                    "ZOO504",
                    "ZOO518T"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "BIF101",
                    "BT302",
                    "CS442",
                    "MCD504",
                    "ZOO507",
                    "ZOO511T"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "ZOOI620",
                    "EDU301",
                    "ZOO501P",
                    "ZOO511P",
                    "ZOO516P",
                    "ZOO518P",
                    "ZOO519P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "ZOO620",
                    "ZOO517T",
                    "BT512T",
                    "MIC501T",
                    "ZOO603T"
                ]
            }
        ]
    },
    {
        "id": "accounting-finance",
        "title": "Accounting & Finance",
        "description": "Virtual University study scheme for Accounting & Finance (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT411"
                ]
            },
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ACC311",
                    "ECO404",
                    "FIN624",
                    "MGT201",
                    "STA630"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "FIN611",
                    "MGT610",
                    "MGTI699",
                    "MCM301",
                    "MCM601",
                    "MGMT623",
                    "MGT501",
                    "MGT504"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "FIN621",
                    "MGT699",
                    "BNK601",
                    "EDU401",
                    "EDU406",
                    "MGT404",
                    "MGT502",
                    "MGT605",
                    "MGT611",
                    "MKT530"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "FIN622",
                    "MGT612",
                    "FIN623",
                    "FIN630",
                    "MGMT622",
                    "MGT601",
                    "PSY405",
                    "SOC617",
                    "ACC311",
                    "FIN611",
                    "FIN621",
                    "FIN622",
                    "FIN623",
                    "FIN624",
                    "FIN630",
                    "MGT201",
                    "MGT404",
                    "MGT411",
                    "MGT501",
                    "MGT502",
                    "MGT605",
                    "MGT611",
                    "MGT699"
                ]
            }
        ]
    },
    {
        "id": "business-administration",
        "title": "Business Administration",
        "description": "Virtual University study scheme for Business Administration (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT411",
                    "MGT501"
                ]
            },
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ECO404",
                    "MGMT622",
                    "MGT201",
                    "MGT510",
                    "STA630"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MGTI699",
                    "ACC501",
                    "FIN624",
                    "MCM301",
                    "MCM601",
                    "MGMT611",
                    "MGMT627",
                    "MGMT629",
                    "MGT502",
                    "MGT604",
                    "MGT613"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT415",
                    "MGT699",
                    "BNK601",
                    "BNK603",
                    "EDU406",
                    "FIN621",
                    "FIN622",
                    "HRM627",
                    "HRM630",
                    "MGMT614",
                    "MGMT615",
                    "MGMT625",
                    "MGT603",
                    "MKT530",
                    "MKT624",
                    "PSY405"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "EDU401",
                    "FIN623",
                    "FIN625",
                    "FIN625",
                    "FIN630",
                    "HRM617",
                    "HRM626",
                    "MGMT617",
                    "MGMT631",
                    "MGT401",
                    "MGT601",
                    "MGT604",
                    "MGT610",
                    "MKT621",
                    "MKT625",
                    "SOC617",
                    "ACC501",
                    "BNK601",
                    "BNK603",
                    "FIN621",
                    "FIN622",
                    "FIN623",
                    "FIN625",
                    "FIN630",
                    "HRM627",
                    "MGMT625",
                    "MGMT627",
                    "MGT201",
                    "MGT401",
                    "MGT411",
                    "MGT501",
                    "MGT502",
                    "MGT510",
                    "MGT603",
                    "MGT604",
                    "MGT613",
                    "MKT621",
                    "MKT624"
                ]
            }
        ]
    },
    {
        "id": "commerce",
        "title": "Commerce",
        "description": "Virtual University study scheme for Commerce (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT411"
                ]
            },
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "ECO404",
                    "MGT201",
                    "MGT612",
                    "MKT501",
                    "STA630"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "MGTI699",
                    "ACC501",
                    "HRM624",
                    "MGMT623",
                    "MGMT629",
                    "MGT501",
                    "MGT504",
                    "MGT604",
                    "MGT613",
                    "PSY405",
                    "SOC617"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "BNK603",
                    "FIN624",
                    "MGMT614",
                    "MGT699",
                    "ECO501",
                    "EDU406",
                    "MGT404",
                    "MGT605"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "BNK612",
                    "MGMT615",
                    "MGT302",
                    "STA302",
                    "MCM301",
                    "MCM601",
                    "ACC501",
                    "BNK603",
                    "HRM624",
                    "MGMT623",
                    "MGT201",
                    "MGT404",
                    "MGT411",
                    "MGT501",
                    "MGT604",
                    "MGT605",
                    "MGT613",
                    "MKT501"
                ]
            }
        ]
    },
    {
        "id": "bachelor-of-business-information-technology-bbit",
        "title": "Bachelor of Business & Information Technology (BBIT)",
        "description": "Virtual University study scheme for Bachelor of Business & Information Technology (BBIT) (4 Years).",
        "duration": "4 Years",
        "degreeType": "BS-Lateral",
        "semesters": [
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS302",
                    "CS302",
                    "CS403",
                    "CS403"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "MGT501"
                ]
            },
            {
                "semesterNumber": 1,
                "title": "Semester 1",
                "subjects": [
                    "CS301",
                    "CS504",
                    "CS601",
                    "MGT411",
                    "MGT611",
                    "CS301P"
                ]
            },
            {
                "semesterNumber": 2,
                "title": "Semester 2",
                "subjects": [
                    "CS605",
                    "MGTI699",
                    "ACC501",
                    "ECO404",
                    "MGT201",
                    "MGT502",
                    "MKT501",
                    "MKT530",
                    "MKT621",
                    "SOC617"
                ]
            },
            {
                "semesterNumber": 3,
                "title": "Semester 3",
                "subjects": [
                    "CS610",
                    "MGT699",
                    "CS310",
                    "CS615",
                    "IT430",
                    "MCM601",
                    "MGT415",
                    "PSY405",
                    "CS610P"
                ]
            },
            {
                "semesterNumber": 4,
                "title": "Semester 4",
                "subjects": [
                    "CS614",
                    "CS407",
                    "CS408",
                    "EDU401",
                    "EDU406",
                    "MCM301",
                    "MGMT614",
                    "MGT402",
                    "SOC404",
                    "ACC501",
                    "CS201",
                    "CS302",
                    "CS403",
                    "CS408",
                    "CS504",
                    "CS601",
                    "CS605",
                    "CS610",
                    "CS614",
                    "CS615",
                    "IT430",
                    "MGT402",
                    "MGT501",
                    "MGT502",
                    "MGT611"
                ]
            }
        ]
    }
];
