const mapData = {
    startOptions: [
        { name: "AT-3380 Pöchlarn", coords: [48.2119, 15.209], popup: "Start Hub", isSwiss: false },
        { name: "AT-4550 Kremsmünster", coords: [48.045, 14.128], popup: "Start Hub", isSwiss: false },
        { name: "CH-1162 St. Prex", coords: [46.484, 6.459], popup: "Start Hub", isSwiss: true },
        { name: "CH-4614 Hägendorf", coords: [47.335, 7.862], popup: "Start Hub", isSwiss: true }
    ],
    startPoint: {
        name: "AT-3380 Pöchlarn",
        coords: [48.2119, 15.209],
        popup: "Start Hub",
        isSwiss: false
    },
    customsPoints: [
        {
            name: "DE/CH Waldshut",
            coords: [47.6170431, 8.2451662],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 07:00-19:00, Sat-Sun: Closed",
            waitingTimes: "Trucks: 15-30 min",
            averageWaitingMinutes: 20,
            schedule: {
                Mon: [7, 19],
                Tue: [7, 19],
                Wed: [7, 19],
                Thu: [7, 19],
                Fri: [7, 19],
                Sat: null,
                Sun: null
            }
        },
        {
            name: "IT/CH Chiasso",
            coords: [45.833, 9.033],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 06:00-19:30, Sat-Sun: Closed",
            waitingTimes: "Trucks: 5-15 min",
            averageWaitingMinutes: 10,
            schedule: {
                Mon: [6, 19.5],
                Tue: [6, 19.5],
                Wed: [6, 19.5],
                Thu: [6, 19.5],
                Fri: [6, 19.5],
                Sat: null,
                Sun: null
            }
        },
        {
            name: "DE/CH Thayngen",
            coords: [47.740425, 8.718055],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 07:00-17:30, Sat-Sun: Closed",
            waitingTimes: "Trucks: 10-20 min",
            averageWaitingMinutes: 15,
            schedule: {
                Mon: [7, 17.5],
                Tue: [7, 17.5],
                Wed: [7, 17.5],
                Thu: [7, 17.5],
                Fri: [7, 17.5],
                Sat: null,
                Sun: null
            }
        },
        {
            name: "DE/CH Rheinfelden",
            coords: [47.56111, 7.79167],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 10:00-18:00, Sat-Sun: Closed",
            waitingTimes: "Trucks: 5-10 min",
            averageWaitingMinutes: 8,
            schedule: {
                Mon: [10, 18],
                Tue: [10, 18],
                Wed: [10, 18],
                Thu: [10, 18],
                Fri: [10, 18],
                Sat: null,
                Sun: null
            }
        },
        {
            name: "AT/CH Wolfurt",
            coords: [47.4562236, 9.7451662],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 06:00-16:00, Sat-Sun: Closed",
            waitingTimes: "Trucks: 10-25 min",
            averageWaitingMinutes: 18,
            schedule: {
                Mon: [6, 16],
                Tue: [6, 16],
                Wed: [6, 16],
                Thu: [6, 16],
                Fri: [6, 16],
                Sat: null,
                Sun: null
            }
        },
        {
            name: "AT/CH Tisis",
            coords: [47.066667, 9.6],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 07:00-18:00, Sat-Sun: Closed",
            waitingTimes: "Trucks: 5-10 min",
            averageWaitingMinutes: 7,
            schedule: {
                Mon: [7, 18],
                Tue: [7, 18],
                Wed: [7, 18],
                Thu: [7, 18],
                Fri: [7, 18],
                Sat: null,
                Sun: null
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


