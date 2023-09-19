#version 300 es
#define M_PI 3.1415926535897932384626433832795

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself

uniform float u_Time;

in vec4 vs_Pos;             // The array of vertex positions passed to the shader

in vec4 vs_Nor;             // The array of vertex normals passed to the shader

in vec4 vs_Col;             // The array of vertex colors passed to the shader.

out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.

out vec4 fs_Pos;            // Position to be used to seed noise function

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.


//TODO:
    //derive phi and theta angles based on position.
    //use angles to get wavy look in both x and y direction of spere
float lowFreqDisp(vec4 pos) {
    //float disp = 0.1 * sin(8. * dot(vec4(1.), pos));
    //float disp2 = 0.1 * sin(8. * dot(vec4(1.), vec4(pos.y, pos.z, pos.x, 1.)));
    //axis test

    float phi = atan(pos[0]/pos[1]);
    if (pos[1] == 0.) {phi = M_PI / 2.;}
    float theta = atan(sqrt(pow(pos[0], 2.) + pow(pos[1], 2.))/pos[2]);
    if (pos[2] == 0.) {theta = M_PI / 2.;}

    float offset = 1.;
    float offScale = sin(0.1 * u_Time);
    offset *= offScale;

    float disp1 = 0.08 * sin(4. * phi);
    float disp2 = 0.08 * sin(4. * theta);
    
    float finalDisp = (disp1 + disp2) * offset;
    return finalDisp;
}

float fbm(vec4 pos) {
    float total = 0.0f;
    float pers = 1.0f / 2.0f;
    float octaves = 5.0f;

    for (float i = 0.0f; i < octaves; i++) {
        float freq = pow(2.0f, i);
        float amp = pow(pers, i);

        total += amp * sin(dot(vec3(1.), vec3(pos)) * freq);
    }
    return total;
}

void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation
    fs_Pos = vs_Pos;

    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);          // Pass the vertex normals to the fragment shader for interpolation.
                                                            // Transform the geometry's normals by the inverse transpose of the
                                                            // model matrix. This is necessary to ensure the normals remain
                                                            // perpendicular to the surface after the surface is transformed by
                                                            // the model matrix.

    vec4 modelposition = u_Model * vs_Pos;   // Temporarily store the transformed vertex positions for use below
    modelposition = modelposition + (fs_Nor * lowFreqDisp(modelposition));

    fs_LightVec = lightPos - modelposition;  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
}
