import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Together from 'together-ai';

const app = express();
app.use(express.json()); // body

const port = 3000;

const together = new Together();

const AI_MODEL = Object.freeze({
    LLAMA: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    DEEPSEEK: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
    GUARD: "meta-llama/Meta-Llama-Guard-3-8B"
})

async function chat(model, prompt) {
    if (!prompt) {
        throw new Error('Prompt is required!');
    }
    console.log(`prompt: ${prompt}`);
    const result = await together.chat.completions.create({
        // https://api.together.xyz/models
        model,
        safety_model: AI_MODEL.GUARD,
        messages: [
            { role: "system", content: `don't use markdown, only use korean language and korean character. if Verify once again that you are using Hangul and delete it if it is not.` },
            { role: 'user', content: prompt },
        ],
    });
    console.log(result);
    return result.choices[0].message.content;
}

// app.get('/', async (req, res) => {
app.post('/llama', async (req, res) => {
    console.log(req.body);
    const { prompt } = req.body;
    const answer = await chat(AI_MODEL.LLAMA, prompt);
    console.log(answer);
    res.json({ answer });
})

app.post('/deepseek', async (req, res) => {
    console.log(req.body);
    const { prompt } = req.body;
    const answer = await chat(AI_MODEL.DEEPSEEK, prompt);
    console.log(answer);
    res.json({ answer });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})