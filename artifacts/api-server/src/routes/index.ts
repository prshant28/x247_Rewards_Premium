import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import partnersRouter from "./partners";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(partnersRouter);

export default router;
