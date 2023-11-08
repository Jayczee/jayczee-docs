---
index: true
order: 2
title: 快速开始 - Spring Security配置(1)
icon: /assets/icon/config.png
isOriginal: true
tag:
  - Spring
  - Spring Security
---

# 配置Spring Security
在[上一篇文章](Init.md)我们已经创建了一个Spring Security项目，本节我们将对其进行配置，使其能够使用JWT进行认证，同时完成认证和鉴权的功能。

## 1. 创建数据表
要完成正常的认证和鉴权，我们需要如下表（根据需求可以增减）：
- 用户认证信息表 `sys_user`
- 用户个人信息表 `sys_user_detail`
- 角色表 `sys_role`
- 权限表 `sys_perm`
- 角色权限关联表 `sys_role_perms`
- 用户角色权限关联表 `sys_user_grant`
 
### 1.1 数据表SQL
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

## 2. MyBatis Plus自动生成代码 

### 2.1 添加依赖 

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>latest</version>
</dependency>
```

### 2.2 创建代码生成器并生成代码
可以将代码生成器放在了`test`目录下，生成目录为`src/main/java`下的文件夹。 
具体配置请参考[MyBatis Plus官方文档-生成配置](https://baomidou.com/pages/981406/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE-globalconfig)。
可以参考以下代码进行生成:
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
直接参考官方示例进行代码生成可能会报错，主要是由于生成代码时引用的模版需要单独引入依赖。生成完代码后的一些注解依赖也需要进行引入： 

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
最后得到的项目结构如下： 

![生成代码后的项目结构](https://fs.jayczee.top:1212/img/genStructure.png)

## 3. 配置Spring Security认证步骤 

### 3.1 修改自动生成的SysUser类 
在之前生成的autoGen包中找到SysUser类，对其进行改造，使其实现`UserDetails`接口，实现接口的主要目的是为了能够在Spring Security中使用该类进行认证。 
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
实现了UserDetails接口,主要是实现上面Override的方法。除此之外，还需要添加***authorities***属性，该属性用于存储用户的权限信息。 

### 3.2 添加角色和权限相关的enum类

在`top.jayczee.securitydemo.enums`包下创建`Role`和`Perm`类，用于存储角色和权限的枚举。
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
最后，需要在数据库中的`sys_role`表和`sys_perm`表中添加对应的数据，插入数据的SQL如下: 
```sql
INSERT INTO `security_demo`.`sys_role` (`id`, `create_dt`, `modify_dt`, `role_name`, `role_desc`) VALUES (1, '2023-11-03 08:21:02.836', '2023-11-03 08:21:26.660', 'ROLE_admin', 'System admin');
INSERT INTO `security_demo`.`sys_role` (`id`, `create_dt`, `modify_dt`, `role_name`, `role_desc`) VALUES (2, '2023-11-03 08:21:42.595', '1000-01-01 00:00:00.000', 'ROLE_user', 'Common user');


INSERT INTO `security_demo`.`sys_perm` (`id`, `create_dt`, `modify_dt`, `perm_name`, `perm_desc`) VALUES (1, '2023-11-03 08:22:02.836', '2023-11-03 08:22:26.660', 'system_create', 'permission to create data');
INSERT INTO `security_demo`.`sys_perm` (`id`, `create_dt`, `modify_dt`, `perm_name`, `perm_desc`) VALUES (2, '2023-11-03 08:22:42.595', '1000-01-01 00:00:00.000', 'system_update', 'permission to update data');
``` 

### 3.3 修改ISysUserGrantService，实现搜索用户权限的功能 
Service代码就不放了，定义一下就好了，直接上实现类方法。 

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

### 3.4 添加ApplicationConfig类 
在`top.jayczee.securitydemo.config`包下创建`ApplicationConfig`类，用于配置Spring Security相关的Bean。  
`ApplicationConfig`类本身只是为了方便集中配置用于定义Spring Security配置相关的Bean，命名为`ApplicationConfig`只是为了方便理解，实际上可以命名为任意名称。 

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
userDetailService()方法用于配置`UserDetailsService`，该方法返回的`UserDetailsService`用于在Spring Security中进行认证。
该方法的返回值需要返回一个实现了`UserDetails`接口的类的实例，后续可以在SecurityContext中获取到。 
此处使用SysUserMapper从数据库中找到相同username的用户，若用户存在则将其权限信息存入`authorities`属性中，最后返回该用户。
::: 

## 4. 配置SecurityConfig

### 4.1 添加SecurityConfig类 
在`top.jayczee.securitydemo.config`包下创建`SecurityConfig`类。
```java

```
至此，Spring Security的认证配置暂告一段落。