import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FootballAnalystComponent } from './football-analyst/football-analyst.component';

const routes: Routes = [
  { path: '', component: FootballAnalystComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
