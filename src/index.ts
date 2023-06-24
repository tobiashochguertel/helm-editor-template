import express, { Express } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { exec } from "child_process";
import jsYaml from 'js-yaml';
import fs from 'fs';


dotenv.config();

type ChartYaml = {
  apiVersion: string;
  description: string;
  name: string;
  type: string;
  version: string;
  appVersion: string;
}

type Content = {
  filename: string
  content?: string
  type: string
}

const app: Express = express()
app.use(bodyParser.text({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static('public'));

app.post('/template', async (req, res) => {
  fs.rmSync("./public/chart/", { recursive: true, force: true });
  const chart = new Map<string, Content>();
  for (const value in req.body.chart) {
    chart.set(value, req.body.chart[value]);
  }
  const directories = Array.from(chart.values()).filter((item: Content) => item.type === "directory");
  const files = Array.from(chart.values()).filter((item: Content) => item.type === "file");
  directories.forEach((directory: Content) => {
    try {
      fs.mkdirSync(`./public/chart/${directory.filename}`, { recursive: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error: ${directory.filename}: ${err.message}`)
      }
      if (!(err instanceof Error)) {
        console.log(err);
      }
    }
  });
  files.forEach((file: Content) => {

    try {
      fs.writeFileSync(`./public/chart/${file.filename}`, file.content ?? "");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error: ${file.filename}: ${err.message}`)
      }
      if (!(err instanceof Error)) {
        console.log(err);
      }
    }
  });

  const selection: Content = req.body.selection as Content;
  fs.writeFileSync("./public/chart/" + selection.filename, selection.content || "");

  const myValues: string = req.body.myValues;
  fs.writeFileSync("./public/myValues.yaml", myValues || "");

  // helm template . -f ../myValues.yaml
  exec("helm template ./public/chart -f ./public/myValues.yaml", (error, stdout, stderr) => {
    if (error || stderr) {
      if (error !== null)
        console.log(`error: ${error.message}`);
      console.log(`stderr: ${stderr}`);
      res.json({
        "result": {
          error,
          stderr
        }
      });
      return;
    }
    const chart: ChartYaml = jsYaml.load(fs.readFileSync("./public/chart/Chart.yaml", "utf8")) as ChartYaml;
    const rawYamlOutput = stdout;
    // # Source: auto-deploy-app/templates/service.yaml -> # Source: templates/service.yaml"
    const sourceRegexp = new RegExp(`# Source: ${chart.name}\/`, "g");
    let withSourceOutput = rawYamlOutput.replaceAll(sourceRegexp, "# Source: ");
    withSourceOutput = withSourceOutput.replaceAll("# Source:", "Source:");

    let result = "";
    const parsed = jsYaml.loadAll(withSourceOutput);
    parsed.forEach((item: any) => {
      console.log(item.Source);
      if (item['Source'] === selection.filename) {
        // Remove Source field, which we added to know which content belongs to which file.
        delete item.Source;
        result = JSON.stringify(item, null, 2);
        result = jsYaml.dump(item);
      }
    });
    res.send(result);
    // fs.rmSync("./public/chart/", { recursive: true, force: true });
  });
  // res.json({ "result": "ok" });
});

app.get('/template', async (req, res) => {
  // helm template . -f ../myValues.yaml
  exec("helm template ./public/chart -f ./public/myValues.yaml", (error, stdout, stderr) => {
    if (error || stderr) {
      if (error !== null)
        console.log(`error: ${error.message}`);
      console.log(`stderr: ${stderr}`);
      res.json({
        "result": {
          error,
          stderr
        }
      });
      return;
    }
    const chart: ChartYaml = jsYaml.load(fs.readFileSync("./public/chart/Chart.yaml", "utf8")) as ChartYaml;
    const rawYamlOutput = stdout;
    // # Source: auto-deploy-app/templates/service.yaml -> # Source: templates/service.yaml"
    const sourceRegexp = new RegExp(`# Source: ${chart.name}\/`, "g");
    let withSourceOutput = rawYamlOutput.replaceAll(sourceRegexp, "# Source: ");
    withSourceOutput = withSourceOutput.replaceAll("# Source:", "Source:");
    // console.log(`withSourceOutput: ${withSourceOutput}`);

    const parsed = jsYaml.loadAll(withSourceOutput);
    // console.log(parsed);
    res.json(parsed);
  });
});

const port = process.env.PORT || 5521;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});