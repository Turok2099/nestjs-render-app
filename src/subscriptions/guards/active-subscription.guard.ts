import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(private readonly subs: SubscriptionsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.userId) return false;

    const ok = await this.subs.hasActive(user.userId);
    if (!ok) {
      throw new ForbiddenException('Necesitas una suscripción activa para reservar');
    }
    return true;
  }
}
