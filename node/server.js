import express from "express";
import snmp from "net-snmp";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
  console.log(request.params);
  const { ip, oid, group } = request.query;

  const session = snmp.createSession(ip, group);

  const oids = [oid];

  session.get(oids, function (error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log(result[0].oid + " = " + result[0].value);
      response.json(result[0].value);
    }
    session.close();
  });

  session.trap(snmp.TrapType.LinkDown, function (error) {
    if (error) {
      console.error(error);
    }
  });
});

app.listen(3333, () => {
  console.log("🚀 Server started on port 3333!");
});
