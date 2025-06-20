const mapData = {
    startPoint: {
        name: "AT-3380 Pöchlarn",
        coords: [48.2119, 15.209],
        popup: "Start Hub"
    },
    customsPoints: [
        {
            name: "DE/CH Waldshut",
            coords: [47.6170431, 8.2451662],
            icon: "customs_icon.png", // Placeholder, will need to create/find this
            openingHours: "Mon-Fri: 06:00-22:00, Sat: 06:00-14:00, Sun: Closed",
            waitingTimes: "Trucks: 15-30 min",
            averageWaitingMinutes: 20,
            schedule: {
                Mon: [6, 22],
                Tue: [6, 22],
                Wed: [6, 22],
                Thu: [6, 22],
                Fri: [6, 22],
                Sat: [6, 14],
                Sun: null
            }
        },
        {
            name: "IT/CH Chiasso",
            coords: [45.833, 9.033],
            icon: "customs_icon.png",
            openingHours: "Mon-Sun: 24/7",
            waitingTimes: "Trucks: 5-15 min",
            averageWaitingMinutes: 10,
            schedule: {
                Mon: [0, 24],
                Tue: [0, 24],
                Wed: [0, 24],
                Thu: [0, 24],
                Fri: [0, 24],
                Sat: [0, 24],
                Sun: [0, 24]
            }
        },
        {
            name: "DE/CH Thayngen",
            coords: [47.740425, 8.718055],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 05:00-21:00, Sat: 06:00-13:00, Sun: Closed",
            waitingTimes: "Trucks: 10-20 min",
            averageWaitingMinutes: 15,
            schedule: {
                Mon: [5, 21],
                Tue: [5, 21],
                Wed: [5, 21],
                Thu: [5, 21],
                Fri: [5, 21],
                Sat: [6, 13],
                Sun: null
            }
        },
        {
            name: "DE/CH Rheinfelden",
            coords: [47.56111, 7.79167],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 06:00-20:00, Sat: 07:00-12:00, Sun: Closed",
            waitingTimes: "Trucks: 5-10 min",
            averageWaitingMinutes: 8,
            schedule: {
                Mon: [6, 20],
                Tue: [6, 20],
                Wed: [6, 20],
                Thu: [6, 20],
                Fri: [6, 20],
                Sat: [7, 12],
                Sun: null
            }
        },
        {
            name: "AT/CH Wolfurt",
            coords: [47.4562236, 9.7451662], // Approximate, based on customs office location
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 06:00-22:00, Sat: 06:00-14:00, Sun: Closed",
            waitingTimes: "Trucks: 10-25 min",
            averageWaitingMinutes: 18,
            schedule: {
                Mon: [6, 22],
                Tue: [6, 22],
                Wed: [6, 22],
                Thu: [6, 22],
                Fri: [6, 22],
                Sat: [6, 14],
                Sun: null
            }
        },
        {
            name: "AT/CH Tisis",
            coords: [47.066667, 9.6],
            icon: "customs_icon.png",
            openingHours: "Mon-Sun: 24/7",
            waitingTimes: "Trucks: 5-10 min",
            averageWaitingMinutes: 7,
            schedule: {
                Mon: [0, 24],
                Tue: [0, 24],
                Wed: [0, 24],
                Thu: [0, 24],
                Fri: [0, 24],
                Sat: [0, 24],
                Sun: [0, 24]
            }
        }
    ],
    destinations: [
        {
            name: "CH-1160 Rolle",
            coords: [46.4582, 6.335],
            routes: {
                A_B: {
                    transitTimeHours: 24, // D + 1, 12:00 (assuming 17:00 cut-off, so 19 hours to midnight + 12 hours = 31 hours total, but for D+1 12:00 it's 19 hours from 17:00 to 12:00 next day)
                    earliestArrival: "D + 1, 12:00"
                },
                A_C: {
                    transitTimeHours: 15, // D + 1, 08:00 (assuming 17:00 cut-off, so 19 hours to midnight + 8 hours = 25 hours total, but for D+1 08:00 it's 15 hours from 17:00 to 08:00 next day)
                    earliestArrival: "D + 1, 08:00"
                }
            }
        }
    ]
};

const initialCutoffTime = "17:00"; // Default cut-off time in Pöchlarn (UTC+1)


