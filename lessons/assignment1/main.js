"use strict";

//Classes
import VertexBuffer from '../_classes/VertexBuffer.js';
import IndexBuffer from '../_classes/IndexBuffer.js';
import VertexArray  from '../_classes/VertexArray.js';
import Shader  from '../_classes/Shader.js';
import Renderer from '../_classes/Renderer.js';
import Camera from '../_classes/Camera.js';

//Shaders
var assignmentVertexShader = 
`#version 300 es

layout(location=0) in vec3 a_position; 
layout(location=1) in vec3 a_color; 

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

out vec3 v_color;

void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);

  v_color = a_color;
}
`;

var assignmentFragmentShader = 
`#version 300 es

precision highp float;

layout(location=0) out vec4 outColor;

in vec3 v_color;  

void main() {
  outColor = vec4(v_color, 1.0); 
}
`

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

async function main() {
    let canvas = document.querySelector("#c");
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error('WebGL2 not supported');
        return;
    }

    // 정점 설정
    const angleHornVertices = [
        //x     y       z       r       g       b
        0.0,    1.0,    0.0,    1.0,    0.0,    0.0, // 0번, 위쪽
        1.0,    0.0,    0.0,    0.0,    1.0,    0.0, // 1번
        0.0,    0.0,    1.0,    0.0,    0.0,    1.0, // 2번
        -1.0,   0.0,    0.0,    1.0,    1.0,    0.0, // 3번
        0.0,    0.0,   -1.0,    0.0,    1.0,    1.0, // 4번
    ];

    // 삼각형 설정
    const angleHornIndices = [
        0, 1, 2,  
        0, 2, 3,  
        0, 3, 4,  
        0, 4, 1,  
    ];

    // 버퍼 설정
    let angleHornVA = new VertexArray(gl); 
    let angleHornVB = new VertexBuffer(gl, angleHornVertices);
    angleHornVA.AddBuffer(gl, angleHornVB, [3, 3], [false, false]);  // 위치(3) 및 색상(3) 속성 설정
    let angleHornIB = new IndexBuffer(gl, angleHornIndices, angleHornIndices.length);
    
    // 쉐이더 설정
    let shader = new Shader(gl, assignmentVertexShader, assignmentFragmentShader);
    shader.Bind(gl);

    // 카메라 설정
    let eye = [0.0, 0.0, 5.0];
    let up = [0.0, 1.0, 0.0];
    let yaw = -90.0;
    let pitch = 0.0;
    let mainCamera = new Camera(eye, up, yaw, pitch);
    let view = mainCamera.CalculateViewMatrix();
    shader.SetUniformMat4f(gl, "u_view", view);
    
    // 투영 행렬 설정
    let fovRadian = 60.0 * Math.PI / 180;
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let proj = mat4.create();
    mat4.perspective(proj, fovRadian, aspect, 0.1, 100.0);
    shader.SetUniformMat4f(gl, "u_projection", proj);
    
    // 렌더러 설정
    let renderer = new Renderer();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 배경 검은색
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);  // back face culling

    // 회전 각도 슬라이더 바 UI 설정
    let rotationAngle = 0;
    webglLessonsUI.setupSlider("#PyramidRotationY", {slide: updateRotationAngle, min: 0, max: 360, step: 1});
    function updateRotationAngle(event, ui) {
        rotationAngle = ui.value * Math.PI / 180;
        requestAnimationFrame(drawScene);
    }

    // 드로우
    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        renderer.Clear(gl);  // 이전에 그렸던거 청소

        // 왼쪽 정팔면체 
        {   
            let modelTop = mat4.create();                           // 상단 피라미드
            mat4.translate(modelTop, modelTop, [-2.0, 0.0, 0.0]);   // 왼쪽으로 2만큼 이동
            mat4.rotateY(modelTop, modelTop, rotationAngle);        // rotationAngle 만큼 회전
            
            shader.SetUniformMat4f(gl, "u_model", modelTop);        // shader에 넘긴 후
            renderer.Draw(gl, angleHornVA, angleHornIB, shader);    // draw로 그리기
            
            let modelBottom = mat4.create();
            mat4.translate(modelBottom, modelBottom, [-2.0, 0.0, 0.0]);
            mat4.rotateY(modelBottom, modelBottom, rotationAngle);
            mat4.rotateX(modelBottom, modelBottom, Math.PI);        // 아래로 뒤집기
            
            shader.SetUniformMat4f(gl, "u_model", modelBottom);
            renderer.Draw(gl, angleHornVA, angleHornIB, shader);
        }
    
        // 오른쪽 정팔면체 
        {
            let modelTop = mat4.create();
            mat4.translate(modelTop, modelTop, [2.0, 0.0, 0.0]);    // 오른쪽으로 2만큼
            mat4.rotateY(modelTop, modelTop, -rotationAngle);
            
            shader.SetUniformMat4f(gl, "u_model", modelTop);
            renderer.Draw(gl, angleHornVA, angleHornIB, shader);
    
            let modelBottom = mat4.create();
            mat4.translate(modelBottom, modelBottom, [2.0, 0.0, 0.0]);
            mat4.rotateY(modelBottom, modelBottom, -rotationAngle);
            mat4.rotateX(modelBottom, modelBottom, Math.PI);
            
            shader.SetUniformMat4f(gl, "u_model", modelBottom);
            renderer.Draw(gl, angleHornVA, angleHornIB, shader);
        }
        
        // 다시 그리기
        requestAnimationFrame(drawScene);
    }

    // 초기 그리기
    requestAnimationFrame(drawScene);
}

main();