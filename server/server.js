import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send('Hello from OpenAI');
});

app.post('/', async (req, res) => {
    try {
        const openAIResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${req.body.prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).json({
            bot: openAIResponse.data.choices[0].text
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});