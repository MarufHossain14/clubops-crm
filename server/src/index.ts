import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';

/* route imports */
import projectRoutes from './routes/projectRoutes';

/* Configuration */
dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


/* Routes */
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use("/projects", projectRoutes);

/* Server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
