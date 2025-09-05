import { db } from '../firebaseConfig';
// FIX: Use Firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const csvData = `uid,name,email,photoURL,score,createdAt,lastLogin
"Abc1Def2Ghi3Jkl4Mno5Pqr6Stu7",Liam Garcia,liam.garcia@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Liam%20Garcia",480,"2023-11-20T10:15:30.000Z","2024-05-25T09:00:15.000Z"
"Bcd2Efg3Hij4Klm5Nop6Qrs7Tuv8",Emma Martinez,emma.martinez@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Emma%20Martinez",455,"2023-09-05T18:45:10.000Z","2024-05-24T12:30:45.000Z"
"Cde3Fgh4Ijk5Lmn6Opq7Rst8Uvw9",Noah Rodriguez,noah.rodriguez@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Noah%20Rodriguez",410,"2024-01-10T05:20:00.000Z","2024-05-22T18:10:20.000Z"
"Def4Ghi5Jkl6Mno7Pqr8Stu9Vwx0",Olivia Brown,olivia.brown@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Olivia%20Brown",390,"2023-12-01T22:00:50.000Z","2024-05-25T11:45:00.000Z"
"Efg5Hij6Klm7Nop8Qrs9Tuv0Wxy1",Oliver Davis,oliver.davis@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Oliver%20Davis",350,"2024-02-15T14:30:00.000Z","2024-05-20T08:20:30.000Z"
"Fgh6Ijk7Lmn8Opq9Rst0Uvw1Xyz2",Ava Miller,ava.miller@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Ava%20Miller",321,"2023-08-22T09:05:15.000Z","2024-05-23T21:00:00.000Z"
"Ghi7Jkl8Mno9Pqr0Stu1Vwx2Yza3",Elijah Wilson,elijah.wilson@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Elijah%20Wilson",298,"2024-03-30T11:55:25.000Z","2024-05-19T14:00:10.000Z"
"Hij8Klm9Nop0Qrs1Tuv2Wxy3Zab4",Sophia Moore,sophia.moore@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Sophia%20Moore",275,"2023-10-18T16:10:40.000Z","2024-05-25T10:05:55.000Z"
"Ijk9Lmn0Opq1Rst2Uvw3Xyz4Abc5",Mateo Taylor,mateo.taylor@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Mateo%20Taylor",250,"2024-04-02T07:40:05.000Z","2024-05-18T16:50:00.000Z"
"Jkl0Mno1Pqr2Stu3Vwx4Yza5Bcd6",Isabella Anderson,isabella.anderson@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Isabella%20Anderson",220,"2023-11-11T13:25:35.000Z","2024-05-21T13:13:13.000Z"
"Klm1Nop2Qrs3Tuv4Wxy5Zab6Cde7",Lucas Thomas,lucas.thomas@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Lucas%20Thomas",199,"2024-02-28T23:50:00.000Z","2024-05-22T06:30:00.000Z"
"Lmn2Opq3Rst4Uvw5Xyz6Abc7Def8",Mia Jackson,mia.jackson@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Mia%20Jackson",180,"2023-07-30T08:15:20.000Z","2024-05-24T15:20:10.000Z"
"Mno3Pqr4Stu5Vwx6Yza7Bcd8Efg9",Levi Martin,levi.martin@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Levi%20Martin",155,"2024-05-01T10:00:00.000Z","2024-05-17T19:45:30.000Z"
"Nop4Qrs5Tuv6Wxy7Zab8Cde9Fgh0",Charlotte Jones,charlotte.jones@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Charlotte%20Jones",123,"2023-12-25T12:00:00.000Z","2024-05-25T01:10:05.000Z"
"Opq5Rst6Uvw7Xyz8Abc9Def0Ghi1",Asher Williams,asher.williams@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Asher%20Williams",101,"2024-01-20T17:30:10.000Z","2024-05-23T10:30:40.000Z"
"Pqr6Stu7Vwx8Yza9Bcd0Efg1Hij2",Luna Hernandez,luna.hernandez@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Luna%20Hernandez",95,"2023-09-15T20:20:20.000Z","2024-05-16T22:00:00.000Z"
"Qrs7Tuv8Wxy9Zab0Cde1Fgh2Ijk3",James Lopez,james.lopez@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=James%20Lopez",78,"2024-04-10T06:00:00.000Z","2024-05-20T11:11:11.000Z"
"Rst8Uvw9Xyz0Abc1Def2Ghi3Jkl4",Evelyn Gonzalez,evelyn.gonzalez@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Evelyn%20Gonzalez",60,"2023-10-31T23:59:59.000Z","2024-05-22T09:09:09.000Z"
"Stu9Vwx0Yza1Bcd2Efg3Hij4Klm5",Leo Smith,leo.smith@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Leo%20Smith",42,"2024-05-10T15:00:00.000Z","2024-05-25T11:50:30.000Z"
"Tuv0Wxy1Zab2Cde3Fgh4Ijk5Lmn6",Amelia Johnson,amelia.johnson@example.com,"https://api.dicebear.com/8.x/initials/svg?seed=Amelia%20Johnson",25,"2023-08-01T00:00:01.000Z","2024-05-19T03:00:25.000Z"
`;

// Simple CSV parser
const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const obj: { [key: string]: any } = {};
        // This regex handles quoted strings that may contain commas
        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/"/g, '')) || [];
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            let value: any = values[j];
            if (header === 'score') {
                value = parseInt(value, 10);
            } else if (header === 'createdAt' || header === 'lastLogin') {
                // FIX: Use Firebase v8 compat syntax for Timestamp
                value = firebase.firestore.Timestamp.fromDate(new Date(value));
            }
            obj[header] = value;
        }
        result.push(obj);
    }
    return result;
};


export const seedDatabase = async () => {
    try {
        console.log("Starting database seed...");
        const players = parseCSV(csvData);

        // Using a batch write for efficiency
        // FIX: Use Firebase v8 compat syntax for writeBatch
        const batch = db.batch();
        
        players.forEach(player => {
            if (player.uid) {
                // FIX: Use Firebase v8 compat syntax for document reference
                const userRef = db.collection("users").doc(player.uid);
                batch.set(userRef, player);
            }
        });

        await batch.commit();
        alert(`${players.length} placeholder users have been added/updated in the database.`);
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        alert("An error occurred while seeding the database. Check the console for details.");
    }
};
