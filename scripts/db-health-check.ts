#!/usr/bin/env tsx
// scripts/db-health-check.ts
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

const prisma = new PrismaClient();

interface HealthCheckResult {
  service: string;
  status: "healthy" | "warning" | "error";
  message: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

class DatabaseHealthChecker {
  private results: HealthCheckResult[] = [];

  private addResult(
    service: string,
    status: "healthy" | "warning" | "error",
    message: string,
    responseTime?: number,
    details?: Record<string, unknown>
  ) {
    this.results.push({ service, status, message, responseTime, details });
  }

  async checkDatabaseConnection() {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      this.addResult(
        "Database Connection",
        responseTime < 1000 ? "healthy" : "warning",
        responseTime < 1000 ? "Connection successful" : "Slow connection",
        responseTime
      );
    } catch (error) {
      this.addResult(
        "Database Connection",
        "error",
        `Connection failed: ${error}`,
        Date.now() - startTime
      );
    }
  }

  async checkTableIntegrity() {
    const tables = [
      "User",
      "Tech",
      "Company",
      "Post",
      "Comment",
      "Like",
      "CommentLike",
      "PostTag",
      "UserTech",
      "CompanyTech",
    ];

    for (const tableName of tables) {
      try {
        const startTime = Date.now();
        let count = 0;

        switch (tableName) {
          case "User":
            count = await prisma.user.count();
            break;
          case "Tech":
            count = await prisma.tech.count();
            break;
          case "Company":
            count = await prisma.company.count();
            break;
          case "Post":
            count = await prisma.post.count();
            break;
          case "Comment":
            count = await prisma.comment.count();
            break;
          case "Like":
            count = await prisma.like.count();
            break;
          case "CommentLike":
            count = await prisma.commentLike.count();
            break;
          case "PostTag":
            count = await prisma.postTag.count();
            break;
          case "UserTech":
            count = await prisma.userTech.count();
            break;
          case "CompanyTech":
            count = await prisma.companyTech.count();
            break;
        }

        const responseTime = Date.now() - startTime;
        this.addResult(
          `Table: ${tableName}`,
          "healthy",
          `${count} records`,
          responseTime,
          { recordCount: count }
        );
      } catch (error) {
        this.addResult(
          `Table: ${tableName}`,
          "error",
          `Query failed: ${error}`
        );
      }
    }
  }

  async checkAPIEndpoints() {
    const endpoints = [
      {
        name: "GET /api/techs",
        url: "http://localhost:3000/api/techs?limit=1",
      },
      {
        name: "GET /api/companies",
        url: "http://localhost:3000/api/companies?limit=1",
      },
      {
        name: "GET /api/posts",
        url: "http://localhost:3000/api/posts?limit=1",
      },
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.url);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          this.addResult(
            endpoint.name,
            responseTime < 500 ? "healthy" : "warning",
            `Status: ${response.status}`,
            responseTime,
            {
              status: response.status,
              hasData: data.data && data.data.length > 0,
            }
          );
        } else {
          this.addResult(
            endpoint.name,
            "error",
            `HTTP ${response.status}: ${response.statusText}`,
            responseTime
          );
        }
      } catch (error) {
        this.addResult(endpoint.name, "error", `Request failed: ${error}`);
      }
    }
  }

  async checkDatabasePerformance() {
    try {
      // 복잡한 쿼리 성능 테스트
      const startTime = Date.now();
      await prisma.post.findMany({
        include: {
          author: {
            select: { name: true, level: true },
          },
          tags: {
            include: {
              tech: {
                select: { name: true },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        take: 10,
      });

      const responseTime = Date.now() - startTime;
      this.addResult(
        "Complex Query Performance",
        responseTime < 1000
          ? "healthy"
          : responseTime < 2000
          ? "warning"
          : "error",
        `Complex join query with relations`,
        responseTime
      );
    } catch (error) {
      this.addResult(
        "Complex Query Performance",
        "error",
        `Query failed: ${error}`
      );
    }
  }

  async checkIndexPerformance() {
    try {
      // 인덱스 효율성 테스트 (slug 검색)
      const startTime = Date.now();
      await prisma.tech.findMany({
        where: {
          slug: { in: ["react", "nextjs", "typescript"] },
        },
      });

      const responseTime = Date.now() - startTime;
      this.addResult(
        "Index Performance (Tech.slug)",
        responseTime < 100
          ? "healthy"
          : responseTime < 300
          ? "warning"
          : "error",
        `Index lookup performance`,
        responseTime
      );
    } catch (error) {
      this.addResult(
        "Index Performance",
        "error",
        `Index test failed: ${error}`
      );
    }
  }

  async runFullHealthCheck() {
    console.log(chalk.yellow("🏥 데이터베이스 헬스 체크 시작...\n"));

    try {
      await this.checkDatabaseConnection();
      await this.checkTableIntegrity();
      await this.checkAPIEndpoints();
      await this.checkDatabasePerformance();
      await this.checkIndexPerformance();
    } catch (error) {
      console.error(chalk.red("❌ 헬스 체크 중 오류 발생:"), error);
    }

    this.printResults();
  }

  private printResults() {
    console.log("\n" + chalk.yellow("📊 헬스 체크 결과:"));
    console.log("=".repeat(100));

    const healthy = this.results.filter((r) => r.status === "healthy").length;
    const warning = this.results.filter((r) => r.status === "warning").length;
    const error = this.results.filter((r) => r.status === "error").length;

    this.results.forEach((result) => {
      let icon = "❓";
      let statusColor = chalk.gray;

      switch (result.status) {
        case "healthy":
          icon = "✅";
          statusColor = chalk.green;
          break;
        case "warning":
          icon = "⚠️";
          statusColor = chalk.yellow;
          break;
        case "error":
          icon = "❌";
          statusColor = chalk.red;
          break;
      }

      const responseTimeInfo =
        result.responseTime !== undefined
          ? chalk.gray(`(${result.responseTime}ms)`)
          : "";

      console.log(
        `${icon} ${statusColor(result.status.toUpperCase().padEnd(8))} ${
          result.service
        }: ${result.message} ${responseTimeInfo}`
      );

      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`    ${chalk.gray(`${key}: ${value}`)}`);
        });
      }
    });

    console.log("=".repeat(100));
    console.log(
      `${chalk.green(healthy)} healthy, ${chalk.yellow(
        warning
      )} warnings, ${chalk.red(error)} errors`
    );

    // 전체 시스템 상태 평가
    if (error > 0) {
      console.log(chalk.red("\n🚨 시스템에 심각한 문제가 있습니다!"));
      process.exit(1);
    } else if (warning > 0) {
      console.log(
        chalk.yellow("\n⚠️  시스템에 주의가 필요한 부분이 있습니다.")
      );
    } else {
      console.log(chalk.green("\n🎉 모든 시스템이 정상 작동 중입니다!"));
    }

    // 성능 요약
    const responseTimes = this.results
      .filter((r) => r.responseTime !== undefined)
      .map((r) => r.responseTime!);

    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      console.log(chalk.blue(`\n📈 성능 요약:`));
      console.log(`   평균 응답 시간: ${avgResponseTime.toFixed(1)}ms`);
      console.log(`   최대 응답 시간: ${maxResponseTime}ms`);
    }
  }
}

async function main() {
  const checker = new DatabaseHealthChecker();
  await checker.runFullHealthCheck();
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
