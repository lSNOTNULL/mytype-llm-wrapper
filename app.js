import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Together from 'together-ai';

const app = express();
const port = 3000;

const together = new Together();

app.get('/', async (req, res) => {
    const result = await together.chat.completions.create({
        // https://api.together.xyz/models/meta-llama/Llama-3.3-70B-Instruct-Turbo-Free
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
            { role: 'user', content: '오늘 저녁 메뉴 추천 좀' },
        ],
    });
    res.json(result.choices[0].message.content);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})