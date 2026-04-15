import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import partnersRouter from "./partners";
import chatRouter from "./chat";
import giveawayRouter from "./giveaway";
import storageRouter from "./storage";
import contestsRouter from "./contests";
import usersRouter from "./users";
import winnersRouter from "./winners";
import voiceRouter from "./voice";
import referralsRouter from "./referrals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(partnersRouter);
router.use(chatRouter);
router.use(giveawayRouter);
router.use(storageRouter);
router.use(contestsRouter);
router.use(usersRouter);
router.use(winnersRouter);
router.use(voiceRouter);
router.use(referralsRouter);

export default router;
