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
            waitingTimes: "Trucks: 15-30 min"
        },
        {
            name: "IT/CH Chiasso",
            coords: [45.833, 9.033],
            icon: "customs_icon.png",
            openingHours: "Mon-Sun: 24/7",
            waitingTimes: "Trucks: 5-15 min"
        },
        {
            name: "DE/CH Thayngen",
            coords: [47.740425, 8.718055],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 05:00-21:00, Sat: 06:00-13:00, Sun: Closed",
            waitingTimes: "Trucks: 10-20 min"
        },
        {
            name: "DE/CH Rheinfelden",
            coords: [47.56111, 7.79167],
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 06:00-20:00, Sat: 07:00-12:00, Sun: Closed",
            waitingTimes: "Trucks: 5-10 min"
        },
        {
            name: "AT/CH Wolfurt",
            coords: [47.4562236, 9.7451662], // Approximate, based on customs office location
            icon: "customs_icon.png",
            openingHours: "Mon-Fri: 06:00-22:00, Sat: 06:00-14:00, Sun: Closed",
            waitingTimes: "Trucks: 10-25 min"
        },
        {
            name: "AT/CH Tisis",
            coords: [47.066667, 9.6],
            icon: "customs_icon.png",
            openingHours: "Mon-Sun: 24/7",
            waitingTimes: "Trucks: 5-10 min"
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


