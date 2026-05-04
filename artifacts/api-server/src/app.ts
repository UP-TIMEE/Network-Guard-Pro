import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http"; // تعديل الاستيراد
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    // تأكدنا أن الاسم هنا يطابق الاستيراد فوق
    logger,
    serializers: {
      req(req: any) {
        // أضفنا : any لمنع خطأ التايب سكريبت
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        // أضفنا : any لمنع خطأ التايب سكريبت
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
