import { PrismaClient, Role, MealType, ResponseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const REAL_STAFF_MEMBERS = [
  { sl: 1, staffId: "1001", name: "MUHAMMAD FASIL", designation: "ADMIN ASSISTANT", dept: "BCA" },
  { sl: 2, staffId: "1002", name: "AK MUHAMMAD", designation: "HOSTEL WARDEN", dept: "BCA" },
  { sl: 3, staffId: "1003", name: "MUHAMMAED RAFI E", designation: "MORAL HEAD", dept: "BCA" },
  { sl: 4, staffId: "1004", name: "SHAHISTHA", designation: "HOSTEL WARDEN", dept: "BCA" },
  { sl: 5, staffId: "1005", name: "MUHAMMED NASIH K", designation: "SOFTWARE DEVELOPER", dept: "BCA" },
  { sl: 6, staffId: "1006", name: "RASHID SINAN P H", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 7, staffId: "1007", name: "MUHAMMAD SAJJAD PP", designation: "ADMINISTRATIVE OFFICER", dept: "BCA" },
  { sl: 8, staffId: "1008", name: "ANUPRABHA", designation: "HOD", dept: "BCA" },
  { sl: 9, staffId: "1009", name: "SUSHINA", designation: "FACULTY", dept: "BCA" },
  { sl: 10, staffId: "1010", name: "ALANTA MATHEW", designation: "FACULTY", dept: "BCA" },
  { sl: 11, staffId: "1011", name: "SUMAYYA U", designation: "HOD", dept: "BCA" },
  { sl: 12, staffId: "1012", name: "ANU MOL", designation: "CRO", dept: "BCA" },
  { sl: 13, staffId: "1013", name: "Husna P H", designation: "Office Administrator", dept: "BCA" },
  { sl: 14, staffId: "1014", name: "Fathima Hasna", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 15, staffId: "1015", name: "Hiba Thasni", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 16, staffId: "1016", name: "SONE SIJI", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 17, staffId: "1017", name: "MUHAMMED MIDHLAJ", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 18, staffId: "1018", name: "SREERAG K K", designation: "SOFTWARE DEVELOPER", dept: "BCA" },
  { sl: 19, staffId: "1019", name: "ANJALY C J", designation: "TELECALLER", dept: "BCA" },
  { sl: 20, staffId: "1020", name: "Ajmeer Habibullah Sayed", designation: "CAO", dept: "BCA" },
  { sl: 21, staffId: "1021", name: "ALEENA SAJI", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 22, staffId: "1022", name: "SHYAMJITH", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 23, staffId: "1023", name: "NANDHANA", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 24, staffId: "1024", name: "MUBASHIR", designation: "OJT TRAINER", dept: "BCA" },
  { sl: 25, staffId: "1025", name: "HISBULLAH RABBANI", designation: "HOSTEL WARDEN", dept: "BCA" },
  { sl: 26, staffId: "1026", name: "SHIBILI AZHARI", designation: "HOSTEL WARDEN", dept: "BCA" },
  { sl: 27, staffId: "1027", name: "SHYLA RAHEEM", designation: "RECEPTIONIST cum Hygine Staff", dept: "DBI" },
  { sl: 28, staffId: "1028", name: "AJMAL", designation: "ACCOUNTS EXECUTIVE", dept: "DBI" },
  { sl: 29, staffId: "1029", name: "KENZ ABDUL", designation: "IT", dept: "DBI" },
  { sl: 30, staffId: "1030", name: "SAAD IRFANI", designation: "MARKETING", dept: "DBI" },
  { sl: 31, staffId: "1031", name: "RAFI IRFANI", designation: "MARKETING", dept: "DBI" },
  { sl: 32, staffId: "1032", name: "SABITH ABOOBACKER", designation: "GRAPHIC DESIGNER", dept: "DBI" },
  { sl: 33, staffId: "1033", name: "AMEER ALI K", designation: "ELECTRICIAN", dept: "DBI" },
  { sl: 34, staffId: "1034", name: "UMARUL FAROOK", designation: "MEDIA", dept: "DBI" },
  { sl: 35, staffId: "1035", name: "Muhammed Siraj", designation: "HR Executive", dept: "DBI" },
  { sl: 36, staffId: "1036", name: "Abdul Buhari", designation: "Manager Admin", dept: "DBI" },
  { sl: 37, staffId: "1037", name: "NOUFAL MANDALIL", designation: "HR MANAGER", dept: "DBI" },
  { sl: 38, staffId: "1038", name: "Alikunhi", designation: "Operations Assistant", dept: "DBI" },
  { sl: 39, staffId: "1039", name: "Mashuqe Ali", designation: "FINANCE MANAGER", dept: "DBI" },
  { sl: 40, staffId: "1040", name: "ABDUL SAMAD", designation: "ACADEMIC DIRECTOR", dept: "DBI" },
  { sl: 41, staffId: "1041", name: "Salmanul Faris", designation: "MEP Engineer", dept: "DBI" },
  { sl: 42, staffId: "1042", name: "JAYAPRAKASH", designation: "GARDNER", dept: "DBI" },
  { sl: 43, staffId: "1043", name: "Abdul Salam K M", designation: "Security Head", dept: "DBI" },
  { sl: 44, staffId: "1044", name: "SA-AD QUTHUBI", designation: "ACADEMIC DEAN", dept: "DBI" },
  { sl: 45, staffId: "1045", name: "IBRAHIM", designation: "SECURITY", dept: "DBI" },
  { sl: 46, staffId: "1046", name: "Muhammed Shadil", designation: "Administrative Assistant", dept: "DBI" },
  { sl: 47, staffId: "1047", name: "Mubashira M", designation: "Office Assistant", dept: "DBI" },
  { sl: 48, staffId: "1048", name: "Sachin P K", designation: "Finance Analyist", dept: "DBI" },
  { sl: 49, staffId: "1049", name: "Vyshnav P A", designation: "Accountant", dept: "DBI" },
  { sl: 50, staffId: "1050", name: "Mohammed Noorudheen", designation: "Chief Officer - Innovation & Development", dept: "DBI" },
  { sl: 51, staffId: "1051", name: "ABDUL MAJEED O K", designation: "SECURITY -G HOSTEL ENGP", dept: "HCE" },
  { sl: 52, staffId: "1052", name: "ABDURAHIMAN SECURITY", designation: "SECURITY", dept: "HCE" },
  { sl: 53, staffId: "1053", name: "MUHAMMED ALI", designation: "Driver", dept: "HCE" },
  { sl: 54, staffId: "1054", name: "ABDUL MAJEED.E.", designation: "ACCOUNTANT", dept: "HCE" },
  { sl: 55, staffId: "1055", name: "BASHEER", designation: "RECEPTIONIST", dept: "HCE" },
  { sl: 56, staffId: "1056", name: "JALEELA T H", designation: "KITCHEN", dept: "HCE" },
  { sl: 57, staffId: "1057", name: "Subaidha P K", designation: "KITCHEN", dept: "HCE" },
  { sl: 58, staffId: "1058", name: "SHAHIDHA KL", designation: "HOUSE KEEPING", dept: "HCE" },
  { sl: 59, staffId: "1059", name: "ABDUL NASER A K", designation: "SECURITY- SOLAR HOSTEL", dept: "HCE" },
  { sl: 60, staffId: "1060", name: "SAKEENA P K", designation: "KITCHEN", dept: "HCE" },
  { sl: 61, staffId: "1061", name: "SAJITHA V C", designation: "CLEANING - SCHOOL", dept: "HCE" },
  { sl: 62, staffId: "1062", name: "Sajina", designation: "HILLS WARDEN", dept: "HCE" },
  { sl: 63, staffId: "1063", name: "Asiya K M Muhammedali", designation: "HILLS WARDEN", dept: "HCE" },
  { sl: 64, staffId: "1064", name: "ABDURAHMAN KORANGAD", designation: "HILLS SECURITY", dept: "HCE" },
  { sl: 65, staffId: "1065", name: "SALAM", designation: "HILLS SECURITY", dept: "HCE" },
  { sl: 66, staffId: "1066", name: "SURENDRAN", designation: "HILLS SECURITY", dept: "HCE" },
  { sl: 67, staffId: "1067", name: "SHAMEERA", designation: "CM BOYS HOSTEL CLEANING", dept: "HCE" },
  { sl: 68, staffId: "1068", name: "Jiji", designation: "House Keeping - Boys Hostel", dept: "HCE" },
  { sl: 69, staffId: "1069", name: "Faseela P P", designation: "House Keeping General", dept: "HCE" },
  { sl: 70, staffId: "1070", name: "JUHAINA", designation: "CM BOYS HOSTEL CLEANING", dept: "HCE" },
  { sl: 71, staffId: "1071", name: "FATHIMA", designation: "HILLS CLEANING", dept: "HCE" },
  { sl: 72, staffId: "1072", name: "SHAIJI K N", designation: "HOUSE KEEPING - A BLOCK", dept: "HCE" },
  { sl: 73, staffId: "1073", name: "RAMLA", designation: "HILLS CLEANING", dept: "HCE" },
  { sl: 74, staffId: "1074", name: "Parvathy", designation: "HILLS CLEANING", dept: "HCE" },
  { sl: 75, staffId: "1075", name: "Rasiya", designation: "Housekeeping - Kaithappoyil", dept: "HCE" },
  { sl: 76, staffId: "1076", name: "Naseema", designation: "HILLS CLEANING", dept: "HCE" },
  { sl: 77, staffId: "1077", name: "SEETHA", designation: "HOUSE KEEPING SCHOOL", dept: "HCE" },
  { sl: 78, staffId: "1078", name: "MANSOORA M", designation: "HOUSE KEEPING - SCHOOL", dept: "HCE" },
  { sl: 79, staffId: "1079", name: "ASIYA N", designation: "HOUSE KEEPING SCHOOL", dept: "HCE" },
  { sl: 80, staffId: "1080", name: "SAJNA", designation: "HOUSE KEEPING - SOLAR HOSTEL", dept: "HCE" },
  { sl: 81, staffId: "1081", name: "SUBAIDHA", designation: "HOUSE KEEPING - SOLAR HOSTEL", dept: "HCE" },
  { sl: 82, staffId: "1082", name: "SAFEENA P K", designation: "CLEANING - SCHOOL", dept: "HCE" },
  { sl: 83, staffId: "1083", name: "Shabna K", designation: "CLEANING - SCHOOL", dept: "HCE" },
  { sl: 84, staffId: "1084", name: "AHAMMED KABEER BUKHARI", designation: "Mentor - English", dept: "HFS" },
  { sl: 85, staffId: "1085", name: "SHAHEED SAQAFI", designation: "HOSTEL COORDINATOR", dept: "HFS" },
  { sl: 86, staffId: "1086", name: "Moideen Yasif", designation: "CA", dept: "HFS" },
  { sl: 87, staffId: "1087", name: "ABOOBACKER AL WARIS", designation: "Mentor- islamics", dept: "HFS" },
  { sl: 88, staffId: "1088", name: "Younus", designation: "Supervisor", dept: "HFS" },
  { sl: 89, staffId: "1089", name: "ILYAS SIDHEEQI", designation: "Mentor- islamics", dept: "HFS" },
  { sl: 90, staffId: "1090", name: "DILSHAD", designation: "BOTTONEY", dept: "HFS" },
  { sl: 91, staffId: "1091", name: "MUHAMMED MAHROOF PP", designation: "OFFICE", dept: "HFS" },
  { sl: 92, staffId: "1092", name: "MUHAMMED IRFAN KP", designation: "Mentor - Business", dept: "HFS" },
  { sl: 93, staffId: "1093", name: "AYISHA SHANA", designation: "Admin Officer", dept: "HFS" },
  { sl: 94, staffId: "1094", name: "SHIHABUDHEEN. N", designation: "PRINCIPAL", dept: "HFS" },
  { sl: 95, staffId: "1095", name: "Farhana sherin P", designation: "Academic mentor, SOCIOLOGY & HISTORY", dept: "HFS" },
  { sl: 96, staffId: "1096", name: "Uvais V", designation: "Academic mentor, PHYSICS", dept: "HFS" },
  { sl: 97, staffId: "1097", name: "Anas al varit", designation: "Personal mentor & Second language", dept: "HFS" },
  { sl: 98, staffId: "1098", name: "Anas saqafi", designation: "Personal mentor & Second language", dept: "HFS" },
  { sl: 99, staffId: "1099", name: "Shahana CV", designation: "Personal mentor & PSYCHOLOGY", dept: "HFS" },
  { sl: 100, staffId: "1100", name: "Muhammed Swalih K", designation: "Mentor Islamic", dept: "HFS" },
  { sl: 101, staffId: "1101", name: "Muhammed Shahil KC", designation: "Mentor, Chemistry", dept: "HFS" },
  { sl: 102, staffId: "1102", name: "Habeeb Rahman", designation: "Accountant", dept: "HFS" },
  { sl: 103, staffId: "1103", name: "Fathima Hiba KT", designation: "Mentor CS", dept: "HFS" },
  { sl: 104, staffId: "1104", name: "Muhammed Rishad", designation: "Mentor maths", dept: "HFS" },
  { sl: 105, staffId: "1105", name: "Swafvan", designation: "SRO", dept: "HFS" },
  { sl: 106, staffId: "1106", name: "ADEEB SHAFI", designation: "ACADEMIC CO-ORDINATOR", dept: "HRPT" },
  { sl: 107, staffId: "1107", name: "MUBASHIR MP", designation: "Program Director", dept: "HRPT" },
  { sl: 108, staffId: "1108", name: "Safeena", designation: "Mentor", dept: "HRPT" },
  { sl: 109, staffId: "1109", name: "Shahana AM", designation: "Mentor", dept: "HRPT" },
  { sl: 110, staffId: "1110", name: "MUHSINA TC", designation: "IAS", dept: "IAS" },
  { sl: 111, staffId: "1111", name: "MOHAMMED RAFEEQUE NV", designation: "IAS", dept: "IAS" },
  { sl: 112, staffId: "1112", name: "Shahina V P", designation: "IAS", dept: "IAS" },
  { sl: 113, staffId: "1113", name: "Fathima Rana Foumi", designation: "IAS", dept: "IAS" },
  { sl: 114, staffId: "1114", name: "Muhammed Bilal T B", designation: "IAS", dept: "IAS" },
  { sl: 115, staffId: "1115", name: "Muhammed Raihan Rabbani", designation: "IAS", dept: "IAS" },
  { sl: 116, staffId: "1116", name: "Jaseela MP", designation: "Mentor BS", dept: "HFS" },
];

async function main() {
  console.log("🌱 Starting DBI Food Portal real staff migration & seed...");

  const passwordHashAdmin = await bcrypt.hash("Admin@12345", 10);
  const passwordHashCanteen = await bcrypt.hash("Canteen@12345", 10);
  const passwordHashStaff = await bcrypt.hash("Staff@12345", 10);

  // 1. Ensure Lead Administrator exists
  const admin = await prisma.user.upsert({
    where: { staffId: "ADMIN001" },
    update: {},
    create: {
      staffId: "ADMIN001",
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: false,
      profile: {
        create: {
          fullName: "Lead Administrator",
          department: "DBI • Administration",
          phone: "+91 9876543210",
        },
      },
    },
  });
  console.log(`✅ Admin account confirmed: ${admin.staffId}`);

  // 2. Ensure Canteen Operator exists
  const canteen = await prisma.user.upsert({
    where: { staffId: "CANTEEN01" },
    update: {},
    create: {
      staffId: "CANTEEN01",
      passwordHash: passwordHashCanteen,
      role: Role.CANTEEN,
      isActive: true,
      mustChangePassword: false,
      profile: {
        create: {
          fullName: "Main Canteen Counter",
          department: "Hospitality & Catering",
        },
      },
    },
  });
  console.log(`✅ Canteen account confirmed: ${canteen.staffId}`);

  // 3. Remove Demo Staff accounts (EMP101, EMP102, EMP103, EMP104)
  const demoStaffIds = ["EMP101", "EMP102", "EMP103", "EMP104"];
  const deleted = await prisma.user.deleteMany({
    where: {
      staffId: { in: demoStaffIds },
    },
  });
  console.log(`🗑️ Removed ${deleted.count} demo staff accounts (${demoStaffIds.join(", ")}).`);

  // 4. Upsert all 116 real staff accounts
  console.log(`👥 Seeding ${REAL_STAFF_MEMBERS.length} real staff members...`);
  let createdCount = 0;
  let updatedCount = 0;

  for (const staff of REAL_STAFF_MEMBERS) {
    const formattedDept = `${staff.dept} • ${staff.designation}`;

    const existing = await prisma.user.findUnique({
      where: { staffId: staff.staffId },
      include: { profile: true },
    });

    if (existing) {
      await prisma.staffProfile.upsert({
        where: { userId: existing.id },
        update: {
          fullName: staff.name,
          department: formattedDept,
        },
        create: {
          userId: existing.id,
          fullName: staff.name,
          department: formattedDept,
        },
      });
      updatedCount++;
    } else {
      await prisma.user.create({
        data: {
          staffId: staff.staffId,
          passwordHash: passwordHashStaff,
          role: Role.STAFF,
          isActive: true,
          mustChangePassword: true, // Requires first-login password change
          profile: {
            create: {
              fullName: staff.name,
              department: formattedDept,
            },
          },
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Real staff seeded: ${createdCount} created, ${updatedCount} updated.`);

  const totalUsers = await prisma.user.count({ where: { role: Role.STAFF } });
  console.log(`🌟 Total active staff in database: ${totalUsers}`);
  console.log("🌟 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
