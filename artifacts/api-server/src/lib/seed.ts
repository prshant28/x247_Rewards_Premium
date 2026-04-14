import { db } from "@workspace/db";
import { partnersTable, contestsTable, winnersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function seedDatabase() {
  try {
    let seedPartnerIds: number[] = [];
    const [partnerCount] = await db.select({ count: sql<number>`count(*)` }).from(partnersTable);
    const [contestCount] = await db.select({ count: sql<number>`count(*)` }).from(contestsTable);

    if (Number(partnerCount?.count || 0) === 0) {
      logger.info("Seeding partners...");
      const seededPartners = await db.insert(partnersTable).values([
        {
          slug: "solution-challenge-2026",
          name: "Solution Challenge 2026",
          tagline: "Hack2Skill — Students Only",
          description: "Register for the Google Solution Challenge 2026 on Hack2Skill. This is a nationwide hackathon by Google Developer Groups on Campus. Fill the complete registration form to earn your first giveaway entry. Open to students enrolled in university/college only (age 18+). Teams of 1–4 members.",
          category: "Registration",
          registrationUrl: "https://vision.hack2skill.com/event/solution-challenge-2026/?utm_source=hack2skill&utm_medium=teamdashboard&utm_term=referral-1&utm_campaign=solution-challenge-2026&utm_content=693e29520010adcadec1b495",
          accent: "navy",
          badge: "Required",
          badgeSecondary: "Students Only",
          isActive: true,
          isRequired: true,
          entryPoints: 1,
        },
      ]).returning();
      const partnerIdsList = seededPartners.map(p => p.id);
      logger.info("Partners seeded successfully");
      seedPartnerIds = partnerIdsList;
    }

    if (Number(contestCount?.count || 0) === 0) {
      logger.info("Seeding contests...");
      await db.insert(contestsTable).values([
        {
          name: "Mega Cash Giveaway",
          description: "Win big with our flagship cash prize giveaway! Complete partner registrations and stand a chance to win massive cash rewards.",
          prize: "₹50,000 Cash Prize",
          prizeValue: "₹50,000",
          maxSpots: 100,
          status: "active",
          slug: "mega-cash-giveaway",
          partnerIds: seedPartnerIds,
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          name: "Tech Gadgets Bonanza",
          description: "Premium tech gadgets up for grabs! Register with our partner platforms and enter to win the latest smartphones, tablets, and accessories.",
          prize: "iPhone 16 Pro Max",
          prizeValue: "₹1,44,900",
          maxSpots: 50,
          status: "active",
          slug: "tech-gadgets-bonanza",
          partnerIds: seedPartnerIds,
          endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        },
        {
          name: "Gaming Paradise",
          description: "Level up your gaming setup! Enter for a chance to win gaming consoles, accessories, and gift cards.",
          prize: "PS5 + Gaming Bundle",
          prizeValue: "₹65,000",
          maxSpots: 75,
          status: "active",
          slug: "gaming-paradise",
          partnerIds: seedPartnerIds,
          endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        {
          name: "Student Special",
          description: "Exclusively for students! Win scholarships, course subscriptions, and study materials to boost your academic journey.",
          prize: "₹25,000 Scholarship",
          prizeValue: "₹25,000",
          maxSpots: 200,
          status: "active",
          slug: "student-special",
          partnerIds: seedPartnerIds,
          endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        },
        {
          name: "Weekend Flash",
          description: "Limited time flash giveaway! Quick registration, instant entry. Don't miss this weekend-only opportunity.",
          prize: "₹10,000 Gift Card",
          prizeValue: "₹10,000",
          maxSpots: 30,
          status: "upcoming",
          slug: "weekend-flash",
          partnerIds: seedPartnerIds,
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);
      logger.info("Contests seeded successfully");

      const [winnersExist] = await db.select({ count: sql<number>`count(*)` }).from(winnersTable);
      if (Number(winnersExist?.count || 0) === 0) {
        const contests = await db.select().from(contestsTable);
        const megaCash = contests.find(c => c.slug === "mega-cash-giveaway");
        const techGadgets = contests.find(c => c.slug === "tech-gadgets-bonanza");

        if (megaCash && techGadgets) {
          await db.insert(winnersTable).values([
            {
              contestId: megaCash.id,
              winnerName: "Rahul S.",
              winnerCity: "Mumbai",
              prize: "₹50,000 Cash Prize",
              entryCode: "X247-AB3K-9F2M",
            },
            {
              contestId: techGadgets.id,
              winnerName: "Priya K.",
              winnerCity: "Delhi",
              prize: "iPhone 16 Pro Max",
              entryCode: "X247-CDE7-4H6N",
            },
            {
              contestId: megaCash.id,
              winnerName: "Amit R.",
              winnerCity: "Bangalore",
              prize: "₹25,000 Cash Prize",
              entryCode: "X247-FG9J-2K5P",
            },
          ]);
          logger.info("Sample winners seeded successfully");
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Seed error (non-fatal)");
  }
}
