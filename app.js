import dotenv from 'dotenv';
import express from 'express';
import Together from 'together-ai';

dotenv.config();

const app = express();
app.use(express.json()); // body

const port = 3000;

const together = new Together();

const AI_MODEL = Object.freeze({
    LLAMA: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    DEEPSEEK: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
    GUARD: "meta-llama/Meta-Llama-Guard-3-8B",
    FLUX: "black-forest-labs/FLUX.1-schnell-Free",
    STABLE_DIFFUSION: "stabilityai/stable-diffusion-xl-base-1.0"
});

const IMAGE_RESPONSE_FORMAT = Object.freeze({
    URL: "url",
    B64: "base64",
})

async function image(model, prompt) {
    function getStepsFromModel(model) {
        switch (model) {
            case AI_MODEL.FLUX:
                return 4;
            case AI_MODEL.STABLE_DIFFUSION:
                return 40;
            default:
                throw new Error('Not implemented');
        }
    }

    function getResponseFormatFromMode() {
        switch (process.env.IMAGE_MODE) {
            case "URL":
                return IMAGE_RESPONSE_FORMAT.URL
            case "B64":
                return IMAGE_RESPONSE_FORMAT.B64;
            default:
                throw new Error('Not implemented');
        }
    }

    const result = await together.images.create(
        {
            model,
            prompt,
            width: 1024,
            height: 1024,
            steps: getStepsFromModel(model),
            n: 1,
            seed: -1,
            response_format: getResponseFormatFromMode(),
        }
    )

    return result.data[0];
}

async function chat(model, prompt) {
    if (!prompt) {
        throw new Error('프롬프트가 필요합니다!');
    }
    console.log(`프롬프트: ${prompt}`);
    try {
        const result = await together.chat.completions.create({
            model,
            safety_model: AI_MODEL.GUARD,
            messages: [
                {
                    role: "system",
                    content: `마크다운을 사용하지 말고, 한국어만 사용하고 한국어 글자만 사용해. 혹시라도 영어로 답변하면 다시 한번 한국어와 한글을 사용하는지 확인하고, 그렇지 않다면 삭제해.`
                },
                {role: 'user', content: prompt},
            ],
        });
        console.log(result);
        return result.choices[0].message.content;
    } catch (error) {
        console.error("AI 모델 호출 중 오류:", error);
        throw new Error("AI 모델 호출 중 오류가 발생했습니다.");
    }
}

app.post('/llama', async (req, res) => {
    console.log(req.body);
    const {prompt} = req.body;
    try {
        const answer = await chat(AI_MODEL.LLAMA, prompt);
        console.log("Llama 답변:", answer);
        res.json({answer});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/deepseek', async (req, res) => {
    console.log(req.body);
    const {prompt} = req.body;
    try {
        const answer = await chat(AI_MODEL.DEEPSEEK, prompt);
        console.log("DeepSeek 답변:", answer);
        const regex = /<think>(.*?)<\/think>(.*)/s;
        const match = answer.match(regex);

        if (match) {
            const [_, rawThink, rawSay] = match;
            res.json({think: rawThink.trim(), say: rawSay.trim()});
        } else {
            console.warn("`<think>`와 `</think>` 태그를 찾을 수 없습니다.");
            res.status(400).json({error: "AI 모델 응답 형식이 잘못되었습니다."});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/stable_diffusion', async (req, res) => {
    console.log(req.body);
    const {prompt} = req.body;
    const result = await image(AI_MODEL.STABLE_DIFFUSION, prompt);
    res.json({result});
});

app.post('/flux', async (req, res) => {
    console.log(req.body);
    const {prompt} = req.body;
    const result = await image(AI_MODEL.FLUX, prompt);
    res.json({result});
});

app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`)
});