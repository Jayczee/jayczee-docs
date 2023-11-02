---
index: true
order: 1
title: Initialize Spring Security Project
icon: /assets/icon/init.png
---

# Initialize Spring Security Project
This article uses IntelliJ IDEA 2023.2.2, Spring Boot 3 and Spring Security6 as an example.

## Create Project

### 1 Fill in the project properties

![Fill in the project properties](https://fs.jayczee.top:1212/img/Security6-1-1.png)
::: danger
SpringSecurity6 requires SpringBoot3 or above.
:::

### 2 Select dependencies

![Select dependencies](https://fs.jayczee.top:1212/img/Security6-1-2.png)

### 3 Create Done
After clicking `create` in the previous step, you need to wait for maven to download the dependencies and IDEA to index (usually automatic).

![Project structure after project created](https://fs.jayczee.top:1212/img/initDone.png)

![Pom.xml](https://fs.jayczee.top:1212/img/initPom.png)

### 4 Add extra dependencies
Add extra dependencies in `pom.xml`, the spring dependencies without version will follow the SpringBoot version, here is SpringBoot3.0.12:
```xml
<dependencies>
<!--...dependency above    -->
    <!--        Spring Web-->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!--        MySQL Connector-->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.0.33</version>
        <scope>runtime</scope>
    </dependency>
    <!--        MyBatis Plus-->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.1</version>
    </dependency>
    <!--        Swagger Enhancement-->
    <dependency>
        <groupId>com.github.xiaoymin</groupId>
        <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
        <version>4.1.0</version>
    </dependency>
</dependencies>
```

### 5 Add project configuration
Add project configuration in`application.yml`:
```yaml
# Port
server:
  port: 11212
# Data Source
spring:
    datasource:
        driver-class-name: com.mysql.cj.jdbc.Driver
        url: jdbc:mysql://192.168.10.229:3306/springboot?useUnicode=true&characterEncoding=utf-8&useSSL=false
        username: root
        password: jhkd5960795
        hikari:
            minimum-idle: 5
            maximum-pool-size: 10
            auto-commit: true
            idle-timeout: 30000
            pool-name: DatebookHikariCP
            max-lifetime: 1800000
            connection-timeout: 30000
            connection-test-query: SELECT 1
            validation-timeout: 5000
            leak-detection-threshold: 60000
            initialization-fail-timeout: 1

# SpringDoc OpenAPI
springdoc:
    swagger-ui:
        path: /swagger-ui.html
    api-docs:
        path: /v3/api-docs
    group-configs:
        - group: 'default'
          paths-to-match: '/**'
          packages-to-scan: 'top.jayczee.securitydemo'

# Doc Enhance
knife4j:
    enable: true
    setting:
        language: zh_cn
```
### 6 Test Project
Create a controller class `TestController` in the `controller` package:
```java
package top.jayczee.securitydemo.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @Operation(summary = "Test security")
    @GetMapping("/test.json")
    public String test() {
        return "test";
    }
}
```
Start up the project, then visit `http://localhost:11212/doc.html` , you can see the following page::

![Login Page before the api doc](https://fs.jayczee.top:1212/img/defaultLogin.png) 

Back to IDEA, you can see the following information in the console (the password will change every time you start the project): 

```text
Using generated security password: aa5307c5-70d9-4f13-b0f9-f409f3f50620

This generated password is for development use only. Your security configuration must be updated before running your application in production.
```

When initializing Spring Security, a random password will be generated for testing login.

Log in with ***default username***`user`and ***default password***`aa5307c5-70d9-4f13-b0f9-f409f3f50620`, you can see the following page: 

![Doc page after logging in](https://fs.jayczee.top:1212/img/initDoc.png)

At this point, the preparation before configuring Spring Security has been completed.