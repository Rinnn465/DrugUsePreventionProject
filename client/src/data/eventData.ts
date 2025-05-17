import { Event } from "../types/Events";

export const eventData: Event[] = [
    {
        id: 1,
        name: "Youth Drug Awareness Workshop",
        date: new Date("2023-11-20"),
        location: "Los Angeles, CA",
        description: "An interactive workshop to educate youth about the dangers of drug abuse.",
        organizer: "YouthCare Foundation",
        attendees: 300,
        tags: ["Awareness", "Youth", "Workshop"],
        type: 'offline',
        url: "https://youthdrugawareness.com"
    },
    {
        id: 2,
        name: "Community Drug Prevention Fair",
        date: new Date("2024-01-15"),
        location: "Austin, TX",
        description: "A community event with resources and activities promoting drug prevention.",
        organizer: "Safe Communities Initiative",
        attendees: 500,
        tags: ["Community", "Prevention", "Fair"],
        type: 'offline',
        url: "https://drugpreventionfair.com"
    },
    {
        id: 3,
        name: "Online Seminar: Breaking the Cycle",
        date: new Date("2025-12-10"),
        location: "Online",
        description: "A virtual seminar discussing strategies to break the cycle of addiction.",
        organizer: "Recovery Alliance",
        tags: ["Seminar", "Addiction", "Online"],
        type: 'online',
        url: "https://breakingthecycle.com"
    },
    {
        id: 4,
        name: "Parents Against Drugs Conference",
        date: new Date("2024-03-05"),
        location: "Chicago, IL",
        description: "A conference for parents to learn about drug prevention strategies for their families.",
        organizer: "Parents United",
        attendees: 400,
        tags: ["Parents", "Conference", "Prevention"],
        type: 'offline',
        // url: "https://parentsagainstdrugs.com"
    },
    {
        id: 5,
        name: "Recovery Stories: A Virtual Panel",
        date: new Date("2024-02-20"),
        location: "Online",
        description: "Hear inspiring recovery stories from individuals who overcame addiction.",
        organizer: "Hope & Healing Network",
        tags: ["Recovery", "Panel", "Online"],
        type: 'online',
        url: "https://recoverystoriespanel.com"
    }
];