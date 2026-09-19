import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const detail =
        typeof body === 'string'
          ? { message: body }
          : (body as { message?: string | string[]; error?: string });
      const message = Array.isArray(detail.message)
        ? detail.message.join('; ')
        : (detail.message ?? exception.message);

      response.status(status).json({
        statusCode: status,
        error: detail.error ?? exception.name,
        message,
      });

      return;
    }

    // Anything we did not plan for: log the real cause, tell the client nothing sensitive.
    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong on our side. Please try again',
    });
  }
}
