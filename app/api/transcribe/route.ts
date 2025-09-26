import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const lang = formData.get("lang")
    if (!file || typeof file === "string") {
      return Response.json({ error: "Invalid or missing file upload under 'file'", step: "validate-upload" }, { status: 400 });
    }

    // Save uploaded webm temporarily
    // Derive a temp input filename based on uploaded mime type for ffmpeg
    const uploadedType = (file as File).type || "audio/webm";
    const inExt = uploadedType.includes("mp4")
      ? "mp4"
      : uploadedType.includes("mpeg")
      ? "mp3"
      : uploadedType.includes("ogg")
      ? "ogg"
      : uploadedType.includes("wav")
      ? "wav"
      : uploadedType.includes("x-m4a") || uploadedType.includes("aac")
      ? "m4a"
      : "webm";
    const webmPath = path.join(tmpdir(), `input.${inExt}`);
    const wavPath = path.join(tmpdir(), "output.wav");
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    await writeFile(webmPath, buffer).catch((e) => {
      throw new Error(`Failed to write temp file: ${(e as Error).message}`);
    });

    // Convert webm → wav with ffmpeg
    let ffmpegStdErr = "";
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-y", "-i", webmPath,
        "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
        wavPath,
      ]);

      ffmpeg.stderr?.on("data", (data) => {
        ffmpegStdErr += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg conversion failed: ${ffmpegStdErr.trim()}`));
      });
    });


    // Run local whisper-cli on the machine
    const whisperCliPath = process.env.WHISPER_CLI_PATH || "./whisper-cli";

    //not the same model because of the text
    const whisperModelPath = (() => {
      switch (lang) {
        case "KO":
          return process.env.KO_WHISPER_MODEL_PATH || "../../models/ggml-kotoba-whisper-v1.0.bin";
        case "JP":
          return process.env.JP_WHISPER_MODEL_PATH || "../../models/ggml-kotoba-whisper-v1.0.bin";
        default:
          return process.env.MEDIUM_WHISPER_MODEL_PATH || "../../models/ggml-kotoba-whisper-v1.0.bin";
      }
    })();


    let whisperStdout = "";
    let whisperStderr = "";
    await new Promise<void>((resolve, reject) => {
      //const proc = spawn(whisperCliPath, ["-m", whisperModelPath, "-f", wavPath]);

      const proc = (() => {
        switch (lang) {
          case "CH":
            return spawn(whisperCliPath, ["-m", whisperModelPath, "-f", wavPath, "--prompt", "请用简体中文输出","-l", "zh"]);
          case "DE":
            return spawn(whisperCliPath, ["-m", whisperModelPath, "-f", wavPath,"-l", "de"]);
          case "ES":
            return spawn(whisperCliPath, ["-m", whisperModelPath, "-f", wavPath,"-l", "es"]);
          default:
            return spawn(whisperCliPath, ["-m", whisperModelPath, "-f", wavPath]);
        }
      })();
      proc.stdout?.on("data", (d) => (whisperStdout += d.toString()));
      proc.stderr?.on("data", (d) => (whisperStderr += d.toString()));
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`whisper-cli failed: ${whisperStderr.trim() || whisperStdout.trim()}`));
      });
    });

    // cleanup temp files
    await unlink(webmPath).catch(() => {});
    await unlink(wavPath).catch(() => {});

    // Attempt to extract transcription text from stdout
    const text = whisperStdout.replace(/^\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]\s*/, '').trim();
    console.log(text)
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: (err as Error).message || "Unexpected error", step: "route-catch" }, { status: 500 });
  }
}
