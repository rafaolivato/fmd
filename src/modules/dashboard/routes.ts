import { Router } from 'express';
import { DashboardController } from './controllers/DashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

// Única rota para buscar todas as métricas do dashboard
dashboardRoutes.get('/metrics', dashboardController.getMetrics);


export { dashboardRoutes };