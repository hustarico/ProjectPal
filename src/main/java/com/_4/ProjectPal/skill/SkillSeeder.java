package com._4.ProjectPal.skill;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SkillSeeder {

    private final SkillRepository skillRepository;

    private static final List<String> SKILLS = List.of(
        // Languages
        "C", "C#", "C++", "CSS", "Dart", "Go", "HTML", "Java", "JavaScript",
        "Kotlin", "Lua", "Objective-C", "Perl", "PHP", "Python", "R", "Ruby",
        "Rust", "Scala", "SQL", "Swift", "TypeScript", "Zig",
        // Frontend frameworks / libraries
        "Angular", "Astro", "Bootstrap", "Bulma", "Chakra UI", "D3.js",
        "Electron", "Ember.js", "Flutter", "jQuery", "MUI (Material UI)",
        "Next.js", "Nuxt.js", "React Native", "React", "Redux", "Svelte",
        "Tailwind CSS", "Three.js", "Vue.js",
        // Backend frameworks
        "Actix", "ASP.NET Core", "Django", "Express.js", "FastAPI", "Flask",
        "Gin", "Laravel", "NestJS", "Node.js", "Rails", "Spring Boot",
        // Databases
        "Cassandra", "ClickHouse", "CockroachDB", "Couchbase", "DynamoDB",
        "Elasticsearch", "Firebase Firestore", "MariaDB", "MongoDB", "MySQL",
        "Neo4j", "Oracle DB", "PostgreSQL", "Redis", "SQLite", "Supabase",
        // Cloud & DevOps
        "Ansible", "AWS", "Azure", "Docker", "GCP (Google Cloud)",
        "GitHub Actions", "GitLab CI", "Helm", "Jenkins", "Kubernetes",
        "Nginx", "Prometheus", "Terraform",
        // Tools & Platforms
        "CMake", "Conda", "Cypress", "ESLint", "Git", "Gradle", "GraphQL",
        "gRPC", "Jest", "Kafka", "Linux", "Make", "Maven", "Playwright",
        "Postman", "Prettier", "Puppeteer", "RabbitMQ", "Selenium",
        "Swagger / OpenAPI", "Unity", "Unreal Engine", "Vim", "Vitest",
        "Webpack", "Yarn",
        // AI / Data
        "Jupyter", "LangChain", "LlamaIndex", "Matplotlib", "MLflow",
        "NumPy", "pandas", "PyTorch", "scikit-learn", "TensorFlow"
    );

    @PostConstruct
    public void seed() {
        long existing = skillRepository.count();
        if (existing > 0) {
            log.info("Skills already seeded ({}). Skipping seeder.", existing);
            return;
        }

        log.info("Seeding {} skills...", SKILLS.size());
        for (String name : SKILLS) {
            if (!skillRepository.existsByName(name)) {
                skillRepository.save(Skill.builder().name(name).build());
            }
        }
        log.info("Skill seeding complete.");
    }
}
