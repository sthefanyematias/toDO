
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './pages/login/login';
import { Layout } from './components/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Kanban } from './pages/kanban/kanban';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: Login, title: 'toDO - entrar' },
    {
        path: '', component: Layout, canActivate: [authGuard],
        children: [
            { path: 'home', component: Dashboard, title: 'toDO - inicio' },
            { path: 'kanban', component: Kanban, title: 'toDO - kanban' },
            { path: 'perfil', component: Profile, title: 'toDO - perfil' }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
