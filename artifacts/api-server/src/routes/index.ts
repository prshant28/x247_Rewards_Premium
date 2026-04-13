import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import partnersRouter from "./partners";
import chatRouter from "./chat";
import giveawayRouter from "./giveaway";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(partnersRouter);
router.use(chatRouter);
router.use(giveawayRouter);
router.use(storageRouter);

export default router;
