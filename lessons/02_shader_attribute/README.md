# 2. Shader and Vertex Attribute

앞서 퀴즈의 1번 문제의 정답을 생각해 보셨으면 아셨겠지만, 아직 우리는 GPU가 실행해야 할 프로그램 코드(Shader, 셰이더)를 정의하거나 전달해 주지 않았습니다.

이번 내용에서는 셰이더를 만들어서 GPU에 전달해서 화면에 삼각형이 나타나도록 해 봅시다. 또한 그 과정에서 정점의 attribute라는 것에 대해서 배워 볼 것입니다.

## What is a Shader?

먼저 셰이더에 대해 개념적인 설명부터 간단히 드리자면, 셰이더는 GPU가 이미지를 그리기 위해 실행하는 프로그램입니다. 주어진 데이터를 가지고 이미지를 만드려면 여러 가지 계산이 필요한데, 예전에는 그런 계산 프로그램이 GPU에 내장되어 있었습니다.

하지만 그러면 GPU에 내장된 프로그램대로 말고는 다른 방식으로 이미지를 그릴 수 없기 때문에 이러한 프로그램을 개발자가 직접 짜서 넣을 수 있도록 GPU 구조가 바뀌었습니다. 덕분에 여러 멋진 장면을, 내가 원하는대로 만들 수 있게 되었습니다.

작성해 주어야 하는 프로그램으로 정점 셰이더(vertex shader)와 프래그먼트 셰이더(fragment shader)가 있습니다. 정점 셰이더는 정점의 변환을 계산하는 프로그램이고 프래그먼트 셰이더는 픽셀의 색상을 계산하는 프로그램입니다. <span style="color:red">이 두 프로그램은 필수적으로 개발자가 작성해서 GPU에 전달해 주어야 합니다.</span> 그 외 테셀레이션 셰이더(헐 셰이더), Geometry 셰이더 등은 필요한 경우에만 선택적으로 사용하면 됩니다.

WebGL(and OpenGL)에는 이렇게 셰이더 프로그램을 작성하기 위한 별도의 언어인 GLSL이 있습니다. JS로는 데이터를 준비하고, API를 호출하는 프로그램을, GLSL로는 GPU가 실행할 프로그램을 작성해야 합니다. 또다른 언어를 사용한다고 해서 겁먹으실 것은 없고, 문법 자체는 C와 거의 동일합니다. 계산을 많이 해야 하기 때문에 이를 손쉽게 하기위한 내장 함수들이 추가적으로 제공됩니다. 

(적어도 이 강의에서는) 프로그래밍 문법적인 면 보다는 셰이더가 뭘 위해서, 어떤 방식으로 계산을 하는지를 이해하시는 것이 더 중요하고, 이러한 내용이 이론 강의 내용의 대부분을 차지하고 있습니다.

## How to

이전 코드에서 변화된 내용들을 보자면 아래와 같습니다.

---
1. 셰이더 코드를 저장한 문자열 선언

    ```glsl
    var vertexShaderSource = `#version 300 es
    layout(location=0) in vec4 a_position;
    void main() {
      gl_Position = a_position;
    }
    `;

    var fragmentShaderSource = `#version 300 es
    precision highp float;
    layout(location=0) out vec4 outColor;
    void main() {
      outColor = vec4(0.0,0.0,1.0,1.0);
    }
    `;
    ```

    두 개의 변수를 main함수 밖에 선언했고, 각각 `vertexShaderSource`, `fragmentShaderSource`입니다. 변수에 대입된 것은 문자열입니다. 그리고 이 문자열이 바로 셰이더의 소스코드입니다. 각 셰이더는 메인함수를 가지고 있습니다.

    현재는 다른 부분 말고 `vertexShaderSource`에 있는 `layout(location=0) in vec4 a_position;`에만 일단 주목하십시오.

2. 셰이더 코드를 GPU로 전달(컴파일&링킹)

    ```js
    var program = webglUtils.createProgramFromSources(gl,
					[vertexShaderSource, fragmentShaderSource]);
    ```

    C/C++ 강의를 들으셨으면 우리가 작성한 코드를 실행하기 위해서는 컴파일과 링킹 과정이 필요하다는 것을 아실겁니다. GPU에서도 마찬가지로 위에 만들어둔 소스코드를 GPU로 넘긴 다음에는 컴파일과 링크를 수행해 실행할 수 있는 상태로 만들어야 합니다.

    이러한 컴파일과 링크 과정은 버퍼에 데이터를 넣을때와 마찬가지로 WebGL API를 호출해서 GPU로 명령을 내려서 수행하게 됩니다. 이 과정이 어렵지는 않지만 엄청 중요한 내용은 아니라고 생각해서, 여기서는 그냥 그 과정을 대신해주는 외부 라이브러리(webGLUtils)의 코드를 가져다 쓰고 있습니다.

    두 셰이더가 항상 필요하기 때문에 정점 셰이더의 소스코드와 프래그먼트 셰이더의 소스코드를 한꺼번에 인자로 넘기고 있다는 점에 주의하십시오. 그리고 반환되는 값은 `program` 변수에 저장해 두었는데, 이는 이전 버퍼와 마찬가지로 프로그램의 ID입니다. 셰이더 프로그램도 GPU에 여러개가 있을 수 있으므로 어떤 프로그램을 사용할 것인지 명시하는 데 사용됩니다.

    컴파일과 링크를 어떻게 하는지 궁금하신 분은 `resources/webgl-utils.js`파일을 직접 열어보시거나 WebGL2Fundamentals의 [보일러플레이트 코드](https://webgl2fundamentals.org/webgl/lessons/ko/webgl-boilerplate.html) 글을 읽어 보시길 바랍니다.

3. 프로그램 바인딩

    ```js
    gl.useProgram(program); 
    ```

    버퍼에서 `bindBuffer()`의 의미가 기억이 나시나요? 용어는 다르지만, `useProgram()` 함수는 프로그램을 바인딩(활성화)하는 API로 버퍼 바인딩과 동일한 의미로 생각하시면 됩니다.
---

여기까지가 셰이더 소스코드를 GPU에 보내고 사용 준비를 하는 과정입니다. 아주 간단하죠?

다음은 셰이더 프로그램을 실행할 때 필요한 데이터를 전달하는 부분입니다. 데이터 전달 코드를 보기 전에 먼저 생각해 봅시다.

이전 커밋의 코드를 잘 살펴보면 부족한 부분이 하나 있습니다.

```js
var positions = [ //삼각형의 2차원 좌표 정보. 현재는 RAM에 저장되어 있는 상태
    -0.5, -0.5, // (-0.5, -0.5) 좌표에 점 하나
    0.0,  0.5,  // ( 0.0,  0.5) 좌표에 점 하나
    0.5, -0.5,  // ( 0.5, -0.5) 좌표에 점 하나
];
```

이 부분인데요, 아시다시피 배열은 연속된 데이터의 집합일 뿐입니다. 지금 상태에서는 `positions`는 그냥 6개의 숫자일 뿐입니다. 제가 주석으로 앞의 두개가 첫 번째 점의 좌표, 그 다음 두개가 두 번째 점의 좌표...라고 적어놓긴 했지만, 컴퓨터가 이러한 의미를 알아들을 리 없습니다.

따라서 저 6개의 숫자 데이터를 어떻게 해석할 것인지를 알려주는 과정이 필요합니다.  데이터를 전달하는 것 뿐만이 아니라 데이터를 읽는 방법까지 알려주어야 한다는 뜻입니다.

---

4. Attribute 활성화

    ```js
    gl.enableVertexAttribArray(0); 
    ```

    1.셰이더 코드 부분에서 `layout(location=0) in vec4 a_position;`에 주목하라고 말씀 드렸죠? 여기서 `in` 이라는 키워드는 이 변수(`a_position`)에 필요한 데이터가 RAM으로부터 버퍼를 통해 전달될 것이라는 의미입니다. `location=0`이라는 키워드는 이 변수의 ID가 0번이라는 의미입니다.

    변수는 변수지만, 셰이더에는 변수도 여러 종류가 있습니다. 이렇게 in이 붙은 변수는 attribute라고 하고, 버퍼를 사용해 정점 데이터가 전달됩니다.

    ID가 0이라는 의미는 다음 코드를 함께 보시면 확실히 알 수 있습니다. `enableVertexAttribArray(0)`은 0번 ID에 데이터를 집어넣겠다는 의미구요.

5. Attribute 데이터 해석 방식 전달

    ```js
    gl.vertexAttribPointer(0, //0번째 location을 위한 데이터 해석방법이다.
                    2, //각 데이터는 2개 단위로 이루어져 있다
                    gl.FLOAT, //하나의 데이터는 float 타입이다 (32bit씩 읽어라)
                    false, //데이터의 정규화(normalization)는 필요하지 않다.
                    0, //데이터를 size*sizeof(type)만큼 건너뛰며 읽어라. 즉 2*32bit가 지나면 두 번째 데이터가 나온다
                    0); //0번째 byte부터 데이터를 읽기 시작해라
    ```

    인자들을 하나하나 봅시다.

    - `0`: 지금 이 함수는 0번 ID를 가진 attribute에 대한 데이터 해석방식을 알려주고 있다는 뜻입니다. 즉 `a_position`에 대한 데이터 해석 방식이라고 명시하는 겁니다.
    - `2`: 각 정점에 대해 2개씩 데이터가 전달된다는 의미입니다. 즉 정점 셰이더를 처음 실행할 때 (-0.5, -0.5) 두 값이 `a_position`에 들어가고, 두 번째에는 (0.0,  0.5)가 들어갑니다.
    - `gl.FLOAT`: 데이터 타입을 명시합니다. 사실 GPU로 넘어온 버퍼 데이터는 바이트 덩어리이기 때문에 몇바이트씩 끊어서 어떤 타입으로 해석해야 할지를 알려주는 겁니다.
    - `false`: 데이터의 정규화 여부입니다. 지금은 그리 중요하지 않습니다.
    - `0`: 데이터의 stride길이입니다. 0이면 2개*sizeof(gl.FLOAT)만큼 건너뛰며 읽으라는 뜻입니다. 나중에 더 복잡한 상황에서 설명 드리겠습니다.
    - `0`: 데이터의 offset입니다. 시작 부분 바이트 위치를 지정합니다.

    마지막 두 개인 stide와 offset은 나중에 더 설명하기로 하고, 1,2,3번째 인자를 통해 데이터를 어떻게 끊어 읽어서 어디에 보낼건지가 모두 설명되어 있습니다. 0번 ID인 `a_position`에 데이터를 집어넣는 데 있어서 2개 float씩 끊어서 읽으라고 알려준 것입니다.

---
`http://localhost:8080/lessons/practice/contents.html`(또는 `http://localhost:8080/lessons/02_shader_attribute/contents.html`)에 접속해 보시면 화면에 파란색 삼각형이 나오는 것을 보실 수 있습니다!

설명이 길긴 했지만, 코드로 따지면 단 네줄만 추가되었을 뿐입니다. 문법이 중요한 것이 아니고 어떤 의미인지를 아는 것이 중요합니다.

또한 이 사이트에는 코드 관련한 설명만 있고, 이론에 관한 설명은 강의 시간에 전달됩니다. 이론도 함께 이해하지 않으면 아무런 의미가 없습니다!

## Quiz

1. 프래그먼트 셰이더의 파란색 색상값을 바꾸어 다른 색상으로 그려 보세요.

* answer: `outColor = vec4(0.0,1.0,0.0,1.0);`를 통해 초록색으로 변경

2. positions의 좌표값을 바꾸어 삼각형이 어떻게 변하는지 살펴 보세요.

* answer: `positions`을 바꾸어 해결

3. a_poisition은 vec4 타입인데, 이는 (x,y,z,w) 네 개의 float값으로 이루어진 구조체라는 뜻입니다. 여기에 값을 두 개만 전달했는데요 그러면 값이 어떻게 저장되는 걸까요?

* answer: 나머지는 기본값이 저장될 것 같다. 

4. positions 배열을 한 정점마다 값을 3개, 4개씩 전달하도록 수정해 보세요. 제대로 표시가 되려면 `vertexAttribPointer()`의 인자들을 어떻게 바꿔야 할지 생각해 보세요.

* answer: positions를 열을 n개로 바꾸고, vertexAttribPointer()`의 두번째 인자 값에 n을 입력해 반영한다.

5. 아래와 같은 `positions` 배열에 대해서 동일한 삼각형이 나타나도록 `vertexAttribPointer` 함수 호출을 수정해 보세요.

```js
var positions = [ //삼각형의 2차원 좌표 정보. 현재는 RAM에 저장되어 있는 상태
    0.0, -0.5, -0.5, 0.0, // (-0.5, -0.5) 좌표에 점 하나
    0.0, 0.0,  0.5, 0.0, // ( 0.0,  0.5) 좌표에 점 하나
    0.0, 0.5,  -0.5, 0.0// ( 0.5, -0.5) 좌표에 점 하나
];
```
* answer: `gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4*4, 1*4)`, 2개를 정보로 가지면서, 4개씩 읽되, 앞에 하나는 무시한다. 


## Useful Links

- [WebGL2 보일러플레이트 코드](https://webgl2fundamentals.org/webgl/lessons/ko/webgl-boilerplate.html)
- [WebGL2 작동 원리(WebGL2 Fundamentals)](https://webgl2fundamentals.org/webgl/lessons/ko/webgl-how-it-works.html)
- [WebGL2 상태 다이어그램](https://webgl2fundamentals.org/webgl/lessons/resources/webgl-state-diagram.html)

---

[다음 강의](../03_draw_from_index/)

[목록으로](../)
