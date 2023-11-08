---
index: true
order: 3
title: Quick Start - Configure Spring Security 2
icon: /assets/icon/config.png
isOriginal: true
tag:
  - Spring
  - Spring Security
  - JWT
---

# Configure Spring Security 2

## 1. Configure JWT

### 1.1 What is JWT

JWT, short for `JSON Web Token`, is an open standard (RFC 7519) for securely transmitting information over the network. 
It is a compact and self-contained data format, which is usually used for identity authentication and authorization operations between different systems on the network.
JWT can contain **user identity information**, **permission declarations**, and **other security-related information**. 
This information is encoded as JSON objects and protected by digital signatures or encryption to ensure their integrity and security.


A JWT token consists of three parts: header, payload, and signature.

1. **Header** ：The header contains the type of token and the signature algorithm used to sign the token. The header is encoded with Base64Url and placed at the beginning of the token.
2. **Payload** ：The payload contains the claims. Claims are statements about an entity (usually the user) and additional data. There are three types of claims:
    - **Registered Claims** ：These are some predefined claims, such as iss (issuer), sub (subject), aud (audience), exp (expiration time), and iat (issued at) etc.
    - **Public Claims** ：These are custom claims that can be added to the token as needed, but it is recommended to avoid conflicts with the defined claims.
    - **Private Claims** ：These claims are reserved for sharing custom information between the parties to the token.
3. **Signature** ：The signature is used to verify the message has not been tampered with during transmission. The signature is calculated using the header, payload, and secret key. The secret key is only known to the server, and the client cannot modify the token without knowing the secret key.


The steps of using JWT are as follows:
1. The user is authenticated and logged in, and the server generates the JWT and sends it back to the client.
2. The client includes the JWT in the request header or other appropriate location in subsequent requests.
3. After receiving the request, the server verifies the signature of the JWT to ensure the integrity of the token, and checks the claims in the token to determine the user identity and permissions.
4. If everything is normal, the server processes the request and responds to the client.

The main advantages of JWT (JSON Web Tokens) include compactness, self-containment, ease of transmission, support for cross-origin requests, no need to store session information on the server, and scalability. However, it is essential to handle sensitive information with care, ensure the token's validity, and periodically refresh the token to enhance security.

### 1.2 Add dependencies

Add the following dependencies to `pom.xml`:

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
Adding redis dependencies is for storing user information in redis cache. 
You can still use other methods to store user information, such as database, or even local memory.
:::

### 1.3 Configure Redis

Add the following configuration to `application.yml`(Use your own configuration):

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
    password: 123456
```

Add the following configuration to class `RedisConfig`:

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

Add the following class `RedisCache`:

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

### 1.4 Add JWT related classes

Add the following class `JwtUserDetails`, this class is used to extract user information from JWT:

```java


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

Add the following class `JwtAuthenticationFilter`, this class is for filtering requests and verifying JWT tokens:

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

The steps outlined above are roughly as follows:
1. Obtain the JWT token from the request header.
2. Retrieve user information from the Redis cache.
3. Validate the JWT token for its validity.
4. If the token is valid, set the user information into the SecurityContext.
5. Proceed with the execution of subsequent filters.

## 2. Configure Spring Security

After creating the JWT filter, you need to add it to the Spring Security configuration so that Spring Security can correctly intercept requests and validate JWT tokens.

Add the following class `SecurityConfiguration`:

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

`CustomizedLogoutHandler` is used to clear the user cache in Redis during logout and is implemented as follows:

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

The `R` is a simple custom response class used to return a consistent response format, implemented as follows:

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

At this point, the configuration of Spring Security has been completed, and you can proceed to write test interfaces for testing.