// src/routes/dashboardRoutes.ts
import { Router } from 'express';
import { DashboardController } from './controllers/DashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get('/metrics', dashboardController.getMetrics);
dashboardRoutes.get('/alertas-estoque', dashboardController.getMetrics); // Ou crie um método específico

export { dashboardRoutes };