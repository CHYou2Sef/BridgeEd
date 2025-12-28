
import { ServiceStatus, User, Course, Exercise, GradeResult, Language } from '../types';
import { generateExercise, evaluateExercise } from './gemini';

/**
 * ServiceGateway: Simulates a Supabase Edge Function / gRPC Gateway
 * Orchestrates calls between the frontend and simulated microservices.
 */
class ServiceGateway {
  private static instance: ServiceGateway;
  public health: ServiceStatus[] = [
    { name: 'Learner-Svc', status: 'online', latency: 45 },
    { name: 'Content-Gen', status: 'online', latency: 120 },
    { name: 'Grading-Svc', status: 'online', latency: 85 },
    { name: 'Auth-Edge', status: 'online', latency: 12 }
  ];

  public static getInstance(): ServiceGateway {
    if (!ServiceGateway.instance) ServiceGateway.instance = new ServiceGateway();
    return ServiceGateway.instance;
  }

  // Simulation of a fast-read cache check
  private async simulateLatency(svc: string): Promise<number> {
    const start = performance.now();
    const service = this.health.find(h => h.name === svc);
    const delay = service ? service.latency + Math.random() * 50 : 100;
    await new Promise(r => setTimeout(r, delay));
    const end = performance.now();
    return Math.round(end - start);
  }

  public async fetchPersonalizedExercise(course: Course, lang: Language): Promise<Exercise> {
    const time = await this.simulateLatency('Content-Gen');
    console.debug(`[Edge] Exercise fetched in ${time}ms`);
    return await generateExercise(course.title[lang], course.description[lang], lang);
  }

  public async submitGrading(exercise: Exercise, answer: string, lang: Language): Promise<GradeResult> {
    const time = await this.simulateLatency('Grading-Svc');
    const result = await evaluateExercise(exercise, answer, lang);
    return {
      ...result,
      metadata: { processingTime: time, tokens: answer.length * 1.5 }
    };
  }
}

export const gateway = ServiceGateway.getInstance();
