---
index: true
order: 2
title: Quick Start - Configure Spring Security 1
icon: /assets/icon/config.png
isOriginal: true
tag:
  - Spring
  - Spring Security
---

# Configure Spring Security
[Last Doc](Init.md)we have created a Spring Security project, and now we need to configure it to help us authorize user.

## 1. Create Tables
To complete the normal authentication and authorization, we need the following tables (can be increased or decreased according to requirements):
- User Table `sys_user`
- Table of user detail `sys_user_detail`
- Table of roles `sys_role`
- Table of permissions `sys_perm`
- Tables of relationship between role and perms `sys_role_perms`
- Tables of user grant entry `sys_user_grant`
 
### 1.1 SQL of Tables
```sql
CREATE TABLE `sys_user`
(
    `id`        BIGINT(20) NOT NULL COMMENT 'user id, Primary key',
    `create_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) COMMENT 'Create date time',
    `modify_dt` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00.000' ON UPDATE CURRENT_TIMESTAMP (3) COMMENT 'Modify date time',
    `is_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Delete flag',
    `username` VARCHAR(200) NOT NULL COMMENT 'user name',
    `password`  VARCHAR(200) NOT NULL COMMENT 'user password',
    `locked`    TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'user locked',
    `expire_dt` DATETIME(3) NOT NULL COMMENT 'user expire date time',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='UserTable';

CREATE TABLE `sys_user_detail`
(
    `id`        BIGINT(20) NOT NULL COMMENT 'user id, Primary key',
    `create_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) COMMENT 'Create date time',
    `modify_dt` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00.000' ON UPDATE CURRENT_TIMESTAMP (3) COMMENT 'Modify date time',
    `is_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Delete flag',
    `user_id`  BIGINT(20) NOT NULL COMMENT 'sys_user.id',
    `nick_name` VARCHAR(200) NOT NULL COMMENT 'user nick name',
    `email`  VARCHAR(200) NOT NULL COMMENT 'email',
    `sex`    TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'user locked',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='User Detail Table';

CREATE TABLE `sys_role`
(
    `id`        BIGINT(20) NOT NULL COMMENT 'user id, Primary key',
    `create_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) COMMENT 'Create date time',
    `modify_dt` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00.000' ON UPDATE CURRENT_TIMESTAMP (3) COMMENT 'Modify date time',
    `role_name` VARCHAR(200) NOT NULL COMMENT 'role name',
    `role_desc` VARCHAR(200) NOT NULL COMMENT 'role description',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='Sys Role Table';

CREATE TABLE `sys_perm`
(
    `id`        BIGINT(20) NOT NULL COMMENT 'user id, Primary key',
    `create_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) COMMENT 'Create date time',
    `modify_dt` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00.000' ON UPDATE CURRENT_TIMESTAMP (3) COMMENT 'Modify date time',
    `perm_name` VARCHAR(200) NOT NULL COMMENT 'perm name',
    `perm_desc` VARCHAR(200) NOT NULL COMMENT 'perm desc',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='Sys Perm Table';

CREATE TABLE `sys_role_perms`
(
    `id`        BIGINT(20) NOT NULL COMMENT 'user id, Primary key',
    `create_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) COMMENT 'Create date time',
    `modify_dt` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00.000' ON UPDATE CURRENT_TIMESTAMP (3) COMMENT 'Modify date time',
    `role_id` BIGINT(20) NOT NULL COMMENT 'sys_role.id',
    `perm_id` BIGINT(20) NOT NULL COMMENT 'sys_perm.id',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='Perms of roles Table';

CREATE TABLE `sys_user_grant`
(
    `id`        BIGINT(20) NOT NULL COMMENT 'user id, Primary key',
    `create_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) COMMENT 'Create date time',
    `modify_dt` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00.000' ON UPDATE CURRENT_TIMESTAMP (3) COMMENT 'Modify date time',
    `grant_type` INT(1) NOT NULL COMMENT 'grant type 0:role 1:perm',
    `user_id` BIGINT(20) NOT NULL COMMENT 'user id',
    `grant_id` BIGINT(20) NOT NULL COMMENT 'perm id or role id',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='Sys Grant Table';
```

## 2. MyBatis Plus Auto Gen Code

### 2.1 Add Dependencies

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>latest</version>
</dependency>
```

### 2.2 Create generator and generate code
We can create a generator in `test` directory, and the generated code in `src/main/java` directory. 

The code below is a sample of generator, you can find more details in [MyBatis Plus Official Doc - Config about Gen](https://baomidou.com/pages/981406/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE-globalconfig)。

```java
package top.jayczee.securitydemo;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.rules.DbColumnType;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Types;
import java.util.Collections;

@SpringBootTest
public class AutoGenCodeTest {
    private final static String url = "jdbc:mysql://192.168.10.229:33060/security_demo?useUnicode=true&characterEncoding=utf-8&useSSL=false";
    private final static String username = "root";
    private final static String password = "*****";
    @Test
    void autoGen(){
        FastAutoGenerator.create(url, username, password)
                .globalConfig(builder -> {
                    builder.author("Jayczee") // Author
                            .enableSwagger()
                            .fileOverride()
                            .outputDir("D:\\Code\\security-demo\\src\\main\\java"); // Output dir
                })
                .dataSourceConfig(builder -> builder.typeConvertHandler((globalConfig, typeRegistry, metaInfo) -> {
                    int typeCode = metaInfo.getJdbcType().TYPE_CODE;
                    switch (typeCode){
                        case Types.TINYINT:
                            return DbColumnType.BASE_BOOLEAN;
                        case Types.SMALLINT:
                            return DbColumnType.INTEGER;
                    }
                    return typeRegistry.getColumnType(metaInfo);

                }))
                .packageConfig(builder -> {
                    builder.parent("top.jayczee.securitydemo.autogen") // parent package name
                            .pathInfo(Collections.singletonMap(OutputFile.xml, "D:\\Code\\security-demo\\src\\main\\resources\\mapper")); // Xml Output Dir
                })
                .strategyConfig(builder -> {
                    builder.addInclude("^sys_.*") // Table include
                            .entityBuilder() // Entity Config
                            .enableFileOverride() // Enable File Override
                            .disableSerialVersionUID() // Disable SerialVersionUID
                            .enableLombok() // Enable Lombok
                            .enableChainModel()
                            .mapperBuilder()
                            .enableFileOverride()
                            .enableMapperAnnotation() // Enable Mapper Annotation
                            .serviceBuilder()
                            .enableFileOverride()
                            .build();
                })
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();
    }
}
``` 
::: warning

Following the official examples for code generation may lead to errors, mainly because the templates used during code generation need to be imported separately. Additionally, some annotation dependencies in the generated code also need to be imported.

```xml
        <dependency>
            <groupId>org.freemarker</groupId>
            <artifactId>freemarker</artifactId>
            <version>2.3.31</version>
        </dependency>
        <dependency>
            <groupId>io.swagger</groupId>
            <artifactId>swagger-annotations</artifactId>
            <version>1.6.7</version>
        </dependency>
        <dependency>
            <groupId>org.jetbrains</groupId>
            <artifactId>annotations</artifactId>
            <version>24.0.1</version>
        </dependency>
```
:::
Finally, the project structure after code generation is as follows:

![Project Structure after generating](https://fs.jayczee.top:1212/img/genStructure.png)

## 3. Configure Spring Security

### 3.1 Modify SysUser class
Find the `SysUser` class in the `autoGen` package generated earlier and modify it to implement the `UserDetails` interface. The main purpose of implementing the interface is to use the class for authentication in Spring Security. 
 
```java
/**
 * <p>
 * UserTable
 * </p>
 *
 * @author Jayczee
 * @since 2023-11-03
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("sys_user")
@ApiModel(value = "SysUser", description = "UserTable")
public class SysUser implements UserDetails {

    @ApiModelProperty("user id, Primary key")
    private Long id;

    @ApiModelProperty("Create date time")
    private LocalDateTime createDt;

    @ApiModelProperty("Modify date time")
    private LocalDateTime modifyDt;

    @ApiModelProperty("Delete flag")
    private Boolean isDelete;

    @ApiModelProperty("user name")
    private String username;

    @ApiModelProperty("user password")
    private String password;

    @ApiModelProperty("user locked")
    private Boolean locked;

    @ApiModelProperty("user expire date time")
    private LocalDateTime expireDt;

    private List<String> authorities;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (String authority : this.authorities) {
            authorities.add(new SimpleGrantedAuthority(authority));
        }
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return expireDt.isAfter(LocalDateTime.now());
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

``` 
We implement the `UserDetails` interface, mainly to implement the methods overridden above. In addition, we also need to add the ***authorities*** property, which is used to store the user's permission information. 

### 3.2 Add enums of role and perms

Create `Role` and `Perm` classes under the `top.jayczee.securitydemo.enums` package to store the enumeration of roles and permissions. 

```java
package top.jayczee.securitydemo.enums;

import lombok.Getter;

@Getter
public enum Role {
    ROLE_ADMIN(1, "ROLE_admin", "System Administrator"),
    ROLE_USER(2, "ROLE_user", "Common User"),
    ;
    private final long id;
    private final String name;
    private final String desc;

    Role(long id, String name, String desc) {
        this.id = id;
        this.name = name;
        this.desc = desc;
    }
}
``` 

```java
@Getter
public enum Perm {
    UPDATE(1, "system.create", "permission to create data"),
    CREATE(2, "system.update", "permission to update data"),
    ;
    private final long id;
    private final String name;
    private final String desc;

    Perm(long id, String name, String desc) {
        this.id = id;
        this.name = name;
        this.desc = desc;
    }
}
```
Finally, you need to add the corresponding data in the `sys_role` table and `sys_perm` table in the database. The SQL for inserting data is as follows:
```sql
INSERT INTO `security_demo`.`sys_role` (`id`, `create_dt`, `modify_dt`, `role_name`, `role_desc`) VALUES (1, '2023-11-03 08:21:02.836', '2023-11-03 08:21:26.660', 'ROLE_admin', 'System admin');
INSERT INTO `security_demo`.`sys_role` (`id`, `create_dt`, `modify_dt`, `role_name`, `role_desc`) VALUES (2, '2023-11-03 08:21:42.595', '1000-01-01 00:00:00.000', 'ROLE_user', 'Common user');


INSERT INTO `security_demo`.`sys_perm` (`id`, `create_dt`, `modify_dt`, `perm_name`, `perm_desc`) VALUES (1, '2023-11-03 08:22:02.836', '2023-11-03 08:22:26.660', 'system_create', 'permission to create data');
INSERT INTO `security_demo`.`sys_perm` (`id`, `create_dt`, `modify_dt`, `perm_name`, `perm_desc`) VALUES (2, '2023-11-03 08:22:42.595', '1000-01-01 00:00:00.000', 'system_update', 'permission to update data');
``` 

### 3.3 Modify the `ISysUserGrantService` to search for user permissions.

Code in the implementation class `SysUserGrantServiceImpl` of `ISysUserGrantService` is as follows:

```java
@Service
@RequiredArgsConstructor
public class SysUserGrantServiceImpl extends ServiceImpl<SysUserGrantMapper, SysUserGrant> implements ISysUserGrantService {
    private final SysUserGrantMapper sysUserGrantMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysPermMapper sysPermMapper;
    private final SysRolePermsMapper sysRolePermsMapper;

    @Override
    public List<String> findAllGrantsByUserId(Long userId) {
        final List<String> allGrants = new ArrayList<>();
        final List<SysUserGrant> grantList = sysUserGrantMapper
                .selectList(new QueryWrapper<SysUserGrant>().eq("user_id", userId).select("grant_type", "grant_id"));
        final List<Long> roleGrantIdList = grantList
                .stream()
                .filter(grant -> grant.getGrantType() == GrantType.ROLE.getId())
                .map(SysUserGrant::getGrantId)
                .toList();
        final List<Long> permGrantIdList = new ArrayList<>(grantList
                .stream()
                .filter(grant -> grant.getGrantType() == GrantType.PERM.getId())
                .map(SysUserGrant::getGrantId)
                .toList());
        final List<SysRolePerms> rolePermsList = sysRolePermsMapper.selectList(new QueryWrapper<SysRolePerms>().eq("role_id", roleGrantIdList).select("perm_id"));
        permGrantIdList.addAll(rolePermsList.stream().map(SysRolePerms::getPermId).toList());
        sysRoleMapper.selectList(new QueryWrapper<SysRole>().eq("id", roleGrantIdList).select("name")).forEach(sysRole -> allGrants.add(sysRole.getRoleName()));
        sysPermMapper.selectList(new QueryWrapper<SysPerm>().eq("id", permGrantIdList).select("name")).forEach(sysPerm -> allGrants.add(sysPerm.getPermName()));
        return allGrants;
    }
}
```

### 3.4 Add ApplicationConfig Class
Create an `ApplicationConfig` class in the `top.jayczee.securitydemo.config`package to configure Spring Security-related beans.

The ApplicationConfig class is used solely for the purpose of conveniently centralizing the configuration of beans related to defining Spring Security configurations. The name `ApplicationConfig` is chosen for ease of understanding, but in reality, it can be named anything.
```java 
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final SysUserMapper sysUserMapper;
    private final ISysUserGrantService sysUserGrantService;
    @Bean
    public UserDetailsService userDetailsService(){
        return username -> {
            final SysUser sysUser = sysUserMapper.selectOne(new QueryWrapper<SysUser>().eq("username", username));
            if (sysUser == null) throw new UsernameNotFoundException("User not found");
            //if user existed, find his role and perms
            sysUser.setAuthorities(sysUserGrantService.findAllGrantsByUserId(sysUser.getId()));
            return sysUser;
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
``` 

::: info
The userDetailService() method is used to configure the UserDetailsService, and the UserDetailsService returned by this method is used for authentication in Spring Security.

The return value of this method should be an instance of a class that implements the UserDetails interface, which can later be retrieved from the SecurityContext.

In this context, we use SysUserMapper to find a user with the same username in the database. If the user exists, their permission information is stored in the authorities attribute, and the user is finally returned.
::: 

Up to this point, the configuration of Spring Security authentication is temporarily concluded.