import { User } from "../types/User";
const users: User[] = [
    {
        id: 1,
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        password: "password123",
        role: "member",
        courseTaken: ["Math 101", "Physics 201"],
        appointment: "2023-11-15T10:00:00Z",
        eventTaken: "Tech Conference 2023"
    },
    {
        id: 2,
        name: "Bob Smith",
        email: "bob.smith@example.com",
        password: "securepass456",
        role: "staff",
        courseTaken: ["History 101"],
        appointment: "2023-11-20T14:00:00Z",
        eventTaken: "Art Workshop"
    },
    {
        id: 3,
        name: "Charlie Brown",
        email: "charlie.brown@example.com",
        password: "mypassword789",
        role: "consultant",
        courseTaken: ["Chemistry 101", "Biology 201"],
        appointment: "2023-11-22T09:30:00Z",
        eventTaken: "Science Fair"
    },
    {
        id: 4,
        name: "Diana Prince",
        email: "diana.prince@example.com",
        password: "wonderwoman123",
        role: "manager",
        courseTaken: ["Leadership 101"],
        appointment: "2023-11-25T11:00:00Z",
        eventTaken: "Leadership Summit"
    },
    {
        id: 5,
        name: "Ethan Hunt",
        email: "ethan.hunt@example.com",
        password: "missionimpossible",
        role: "admin",
        courseTaken: ["Spy Tactics 101"],
        appointment: "2023-11-30T16:00:00Z",
        eventTaken: "Security Conference"
    }
];

export default users;