import type { TeacherSchedule } from './types';

export const teacherSchedules: TeacherSchedule[] = [
  {
    teacher: "Laila Zuaiter",
    schedule: [
      { day: "Monday", time: "08:00 - 09:30", className: "12 CAI 51", room: "af-1" },
      { day: "Monday", time: "10:00 - 11:30", className: "11 CAI 51", room: "af-3" },
      { day: "Tuesday", time: "09:30 - 11:00", className: "10 CAI 51", room: "bg-5" },
      { day: "Tuesday", time: "12:00 - 13:30", className: "9 ADV 51", room: "ag-1" },
      { day: "Wednesday", time: "08:00 - 09:30", className: "9 ADV 56", room: "ag-2" },
      { day: "Wednesday", time: "11:00 - 12:30", className: "9 ADV 57", room: "ag-3" },
      { day: "Thursday", time: "09:00 - 10:30", className: "9 ADV 58", room: "bf-10" },
      { day: "Thursday", time: "13:00 - 14:30", className: "8 ADV 51", room: "bf-12" },
      { day: "Friday", time: "08:30 - 10:00", className: "8 ADV 55", room: "bf-14" },
    ],
    classes: [
      { 
        name: "12 CAI 51", 
        students: [
          { name: "Nada Khaled Alblooshi" },
          { name: "Maitha Hazza Alhebsi" },
          { name: "Meera Saleh Aljabri" }
        ]
      },
      { 
        name: "11 CAI 51", 
        students: [
          { name: "Dana Mohammed Alsayari" },
          { name: "Reem Mohammed Alsayari" },
          { name: "Taif Said Alshamsi" }
        ]
      },
      { 
        name: "10 CAI 51", 
        students: [
          { name: "Maitha Saleh Alsayari" },
          { name: "Shaikha Abdullah Alshamsi" },
          { name: "Salama Mohammed Aljenibi" }
        ]
      },
      { 
        name: "9 ADV 51", 
        students: [
          { name: "Fatima Mohammed Al Jaberi" },
          { name: "Mouza Ali Al Shamsi" },
          { name: "Noura Hamdan Al Azmi" }
        ]
      },
      { 
        name: "9 ADV 56", 
        students: [
          { name: "Maha Rashid Albalooshi" },
          { name: "Afra Khalifa Al Khulaifi" },
          { name: "Shamsa Mansour Al Mansoori" }
        ]
      },
      { 
        name: "9 ADV 57", 
        students: [
          { name: "Salama Abdullah Al Marri" },
          { name: "Amina Hamad Al Rashdi" },
          { name: "Aisha Mohammed Al Shryani" }
        ]
      },
      { 
        name: "9 ADV 58", 
        students: [
          { name: "Shamma Mohammed Al Kaabi" },
          { name: "Rouda Ali Al Risi" },
          { name: "Reem Saad Al Nuaimi" }
        ]
      },
      { 
        name: "8 ADV 51", 
        students: [
          { name: "Alya Khalid Al Balushi" },
          { name: "Wedema Mubarak Al Afari" },
          { name: "Mazoon Saleh Al Amri" }
        ]
      },
      { 
        name: "8 ADV 55", 
        students: [
          { name: "Meera Abdullah Al Ajmi" },
          { name: "Maryam Aref Al Khaldi" },
          { name: "Mahra Khalid Al Darmaki" }
        ]
      }
    ]
  }
];
