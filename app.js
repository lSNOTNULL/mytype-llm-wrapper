// const express = require('express')
import express from 'express';
const app = express()
const port = 3000

import dotenv from 'dotenv'
dotenv.config()

import Together from 'together-ai';
const together = new Together();

const stream = await together.chat.completions.create({
    // https://api.together.xyz/models/meta-llama/Llama-3.3-70B-Instruct-Turbo-Free
    // model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    messages: [
        { role: 'user', content: 'What are the top 3 things to do in New York?' },
    ],
    stream: true,
});

for await (const chunk of stream) {
    // use process.stdout.write instead of console.log to avoid newlines
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

app.get('/', (req, res) => {
    // res.send('Hello World!')
    res.send('Good job!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})