---
index: true
order: 3
title: 快速开始 - Spring Security配置(2)
icon: /assets/icon/config.png
isOriginal: true
tag:
  - Spring
  - Spring Security
  - JWT
---

# 配置Spring Security - 2

## 1. 配置JWT

### 1.1 什么是JWT

JWT，全称为JSON Web Token，是一种用于在网络上安全传输信息的开放标准（RFC
7519）。它是一种紧凑且自包含的数据格式，通常用于在不同系统之间进行身份验证和授权操作。JWT可以包含用户的身份信息、权限声明以及其他与安全相关的信息，这些信息被编码为JSON对象，并使用数字签名或加密的方式进行保护，以确保其完整性和安全性。

JWT由三部分组成：

1. **Header（头部）** ：头部通常包含了两部分信息，即令牌的类型（通常为JWT）和所使用的签名算法（如HMAC
   SHA256或RSA）。这部分信息是Base64编码后的JSON对象。
2. **Payload（负载）** ：负载部分包含了令牌的具体内容，也称为声明。这些声明可以分为三种类型：

- **Registered Claims（注册声明）** ：这些是一些预定义的声明，如iss（颁发者）、sub（主题）、aud（受众）、exp（过期时间）和iat（发布时间）等。
- **Public Claims（公共声明）** ：这些是自定义的声明，可以根据需要添加到令牌中，但建议避免与已定义的声明冲突。
- **Private Claims（私有声明）** ：这些声明是为在令牌的各方之间共享自定义信息而保留的。

3. **Signature（签名）** ：为了确保令牌的完整性和真实性，通常会对头部和负载部分进行签名，然后将签名结果添加到令牌的尾部。签名使用令牌的头部中指定的签名算法进行计算。

JWT的工作流程通常如下：

1. 用户进行身份验证并登录，服务器生成JWT并将其发送回客户端。
2. 客户端在后续请求中将JWT包含在请求头部或其他适当的位置。
3. 服务器收到请求后，验证JWT的签名以确保令牌的完整性，并检查令牌中的声明以确定用户身份和权限。
4. 如果一切正常，服务器处理请求并响应客户端。

JWT的主要优点包括紧凑性、自包含性、易于传输、支持跨域、不需要在服务器端存储会话信息，以及具备可扩展性。然而，需要谨慎处理敏感信息，确保令牌的有效性，并定期更新令牌以提高安全性。

### 1.2 引入依赖

在`pom.xml`中添加依赖：

```xml

<dependencies>
    <!-- JWT    -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
    </dependency>
    <!--    redis-->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
</dependencies>
``` 

::: tip
添加Redis依赖是为了将JWT令牌存储到Redis中，以便于后续的令牌管理。也可以自行选择其他缓存方式。
:::

### 1.3 配置Redis

在`application.yml`中添加Redis配置：

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
    password: 123456
```

添加`RedisConfig`类：

```java
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory connectionFactory){
        RedisTemplate<Object, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        
        template.afterPropertiesSet();
        
        return template;
    }
}
```

添加Redis缓存工具类`RedisCache`：

```java
@Component
@RequiredArgsConstructor
@SuppressWarnings({"unchecked", "rawtypes", "unused"})
public class RedisCache {
    private final RedisTemplate redisTemplate;

    public <T> void setCacheObject(final String key, final T value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public <T> void setCacheObject(final String key, final T value, final Integer timeout, final TimeUnit timeUnit) {
        redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
    }

    public boolean expire(final String key, final long timeout) {
        return expire(key, timeout, TimeUnit.SECONDS);
    }

    public boolean expire(final String key, final long timeout, final TimeUnit unit) {
        return Boolean.TRUE.equals(redisTemplate.expire(key, timeout, unit));
    }

    public <T> T getCacheObject(final String key) {
        ValueOperations<String, T> operation = redisTemplate.opsForValue();
        return operation.get(key);
    }

    public boolean deleteObject(final String key) {
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    public long deleteObject(final Collection collection) {
        return redisTemplate.delete(collection);
    }

    public <T> long setCacheList(final String key, final List<T> dataList) {
        Long count = redisTemplate.opsForList().rightPushAll(key, dataList);
        return count == null ? 0 : count;
    }

    public <T> List<T> getCacheList(final String key) {
        return redisTemplate.opsForList().range(key, 0, -1);
    }

    public <T> BoundSetOperations<String, T> setCacheSet(final String key, final Set<T> dataSet) {
        BoundSetOperations<String, T> setOperation = redisTemplate.boundSetOps(key);
        for (T t : dataSet) {
            setOperation.add(t);
        }
        return setOperation;
    }

    public <T> Set<T> getCacheSet(final String key) {
        return redisTemplate.opsForSet().members(key);
    }

    public <T> void setCacheMap(final String key, final Map<String, T> dataMap) {
        if (dataMap != null) {
            redisTemplate.opsForHash().putAll(key, dataMap);
        }
    }

    public <T> Map<String, T> getCacheMap(final String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    public <T> void setCacheMapValue(final String key, final String hKey, final T value) {
        redisTemplate.opsForHash().put(key, hKey, value);
    }

    public <T> T getCacheMapValue(final String key, final String hKey) {
        HashOperations<String, String, T> opsForHash = redisTemplate.opsForHash();
        return opsForHash.get(key, hKey);
    }

    public void delCacheMapValue(final String key, final String hkey) {
        HashOperations hashOperations = redisTemplate.opsForHash();
        hashOperations.delete(key, hkey);
    }

    public <T> List<T> getMultiCacheMapValue(final String key, final Collection<Object> hKeys) {
        return redisTemplate.opsForHash().multiGet(key, hKeys);
    }

    public Collection<String> keys(final String pattern) {
        return redisTemplate.keys(pattern);
    }
}
```

### 1.4 创建JWT相关类

添加`JwtService`类，该类用于生成和解析JWT令牌：

```java
@Service
public class JwtService {
    //You can generate it by yourself.The length of the key must be longer than 256 bits.
    private static final String SecretKey = "AD4428632B4B6250655368566D5979912126763960244226452122716B635183";

    private Claims extractAllClaims(String token){
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) &&!isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public String generateToken(String username){
        return Jwts
                .builder()
                .setIssuer("Security Demo")
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7))
                .signWith(getSignInKey())
                .compact();
    }
}
```

添加`JwtAuthenticationFilter`类，该类用于拦截请求并验证JWT令牌：

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final RedisCache redisCache;
    private final static String TokenHeader = "Bearer ";
    @Override
    protected void doFilterInternal(@NotNull HttpServletRequest request,
                                    @NotNull HttpServletResponse response,
                                    @NotNull FilterChain filterChain) throws ServletException, IOException {
        // get authorization header and validate
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(TokenHeader)) {
            filterChain.doFilter(request, response);
            return;
        }
        final String jwtToken = authHeader.substring(TokenHeader.length());
        // try to get userDetails from redis cache
        SysUser userDetail = redisCache.getCacheObject(jwtToken);
        // if userDetail is not null, which means this token is valid, then set authentication
        if (userDetail != null && jwtService.isTokenValid(jwtToken, userDetail)){
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetail,
                    null,
                    userDetail.getAuthorities()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            //Update the userDetail into the SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}
```

以上的步骤大致为：

1. 从请求头中获取JWT令牌。
2. 从Redis缓存中获取用户信息。
3. 验证JWT令牌是否有效。
4. 如果令牌有效，则将用户信息设置到SecurityContext中。
5. 继续执行后续的过滤器。

## 2. 配置Spring Security

在完成JWT过滤器的创建后，我们需要将其添加到Spring Security的配置中，以便于Spring Security能够正确的拦截请求并验证JWT令牌。

创建`SecurityConfiguration`类：

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;
    private final CustomizedLogoutHandler customizedLogoutHandler;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf()
                .disable() //disable csrf to prevent cross site request forgery
                .authorizeHttpRequests()
                .requestMatchers("/v3/**","/doc**","/swagger-ui/**","/swagger-ui.html","/swagger-resources/**","/webjars/**","/user/**")
                .permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .exceptionHandling()
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .logout()
                .logoutUrl("/user/logout.json")
                .addLogoutHandler(customizedLogoutHandler)
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpStatus.OK.value());
                    response.getWriter().write(objectMapper.writeValueAsString(R.ok("logout success")));
                })
                .clearAuthentication(true)
                .and().build();
    }
}
```

其中，CustomizedLogoutHandler用于在登出时清除Redis中的用户缓存，实现如下：

```java
@Component
@RequiredArgsConstructor
public class CustomizedLogoutHandler implements LogoutHandler {
    private final RedisCache redisCache;
    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        final String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")){
            final String jwtToken = token.substring(7);
            redisCache.deleteObject(jwtToken);
        }
    }
}
```

其中，R是一个简单的自定义的响应类，用于返回统一的响应格式，实现如下：

```java
@Data
public class R<T> {
    private final boolean success;
    private final String message;
    private final T data;

    public R(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }


    public static <T> R<T> ok(String message) {
        return new R<T>(true, message, null);
    }

    public static <T> R<T> okData(T data) {
        return new R<T>(true, null, data);
    }
}
```

至此，SpringSecurity的配置已经完成了，可以编写测试接口进行测试了。