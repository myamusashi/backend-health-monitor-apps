import express from 'express';
import { Registration } from './src/controlers/register';
import { authenticateToken } from './src/middleware/jwt';
import { LoginControler } from './src/controlers/login';

const app = express();
const PORT = process.env.PORT || 300;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
	res.json({
		"hellow": "world"
	})
});

app.post("/login", (req: Request, res: Response) => LoginControler.handle(req, res));
app.post("/registration", Registration)

app.listen("3000", () => {
	console.log("server run");
});

async function startServer() {
	try {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		})
	} catch (error) {
		console.error(`Failed to start server: `, error);
		process.exit(1);
		
	}
}

startServer();

process.on('unhandledRejection', (error) => {
	console.error('Unhadled Rejection', error);
});

process.on('uncaughtException', (error) => {
	console.error("Uncaught exception", error);
	process.exit(1);
	
})
