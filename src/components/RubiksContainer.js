import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';



function RubiksContainer() {
    const mountRef = useRef(null);
    const rotateRightUpRef = useRef(null);
    const rotateRightDownRef = useRef(null);
    const rotateMiddleUpRef = useRef(null);
    const rotateMiddleDownRef = useRef(null);
    const rotateLeftUpRef = useRef(null);
    const rotateLeftDownRef = useRef(null);
    const rotateTopLeftRef = useRef(null);
    const rotateTopRightRef = useRef(null);


    let rightVerticalGroup;
    let middleVerticalGroup;
    let leftVerticalGroup;
    let topHorizontalGroup;
    const xAxis = new THREE.Vector3(1, 0, 0); // X-axis for up/down rotation
    const yAxis = new THREE.Vector3(0, 1, 0); // Y-axis for left/right rotation


    useEffect(() => {
        rightVerticalGroup = new THREE.Group();
        middleVerticalGroup = new THREE.Group();
        leftVerticalGroup = new THREE.Group();
        topHorizontalGroup = new THREE.Group();
        const loader = new FontLoader();
        // Load a font
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {

            // Now you can use the font to create text.
            const textMaterial = new THREE.MeshBasicMaterial({ color: 'white' });

            const createTextLabel = (text, position, rotationY = 0) => {
                const textGeometry = new TextGeometry(text, {
                    font: font,
                    size: 0.3,
                    height: 0.1,
                });
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.copy(position);
                textMesh.rotation.y = rotationY; // Apply rotation if specified
                scene.add(textMesh);
            };

            // Specify positions for each label based on your cube's orientation and size
            createTextLabel('Front', new THREE.Vector3(0, 0, 3));
            createTextLabel('Back', new THREE.Vector3(1, 0, -3), Math.PI); // Rotate 180 degrees to face the opposite direction
            createTextLabel('Up', new THREE.Vector3(0, 3, 0));
            createTextLabel('Down', new THREE.Vector3(0, -3, 0));
            createTextLabel('Left', new THREE.Vector3(-3, 0, 0));
            createTextLabel('Right', new THREE.Vector3(3, 0, 0));
        });


        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;

        // Adjust these values to change the initial camera position
        camera.position.set(0, 0, 7);

        const generateDefaultPositions = () => {
            let positions = [];
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    for (let z = 0; z < 3; z++) {
                        positions.push({ x, y, z });
                    }
                }
            }
            return positions;
        };



        const createAndGroupCubes = () => {
            const cubeSize = 0.9;
            const spacing = 1.05;
            const offset = ((spacing * 2) - spacing) / 2;

            const materials = [
                new THREE.MeshBasicMaterial({ color: 'red' }), // right
                new THREE.MeshBasicMaterial({ color: 'orange' }), // left
                new THREE.MeshBasicMaterial({ color: 'yellow' }), // top
                new THREE.MeshBasicMaterial({ color: 'white' }), // bottom
                new THREE.MeshBasicMaterial({ color: 'green' }), // front
                new THREE.MeshBasicMaterial({ color: 'blue' }), // back
            ];

            const cubes = []; // Create an array to store the cubes.

            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    for (let z = 0; z < 3; z++) {
                        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                        const cube = new THREE.Mesh(geometry, materials);
                        cube.position.set(x * spacing - offset, y * spacing - offset, z * spacing - offset);

                        // Add cube to vertical groups based on x position
                        if (x === 0) {
                            leftVerticalGroup.add(cube);
                        } else if (x === 1) {
                            middleVerticalGroup.add(cube);
                        } else if (x === 2) {
                            rightVerticalGroup.add(cube);
                        } else if (y === 2) {
                            topHorizontalGroup.add(cube);
                        }

                        cubes.push(cube); // Keep track of all cubes

                    }
                }
            }

            scene.add(leftVerticalGroup, middleVerticalGroup, rightVerticalGroup, topHorizontalGroup);

            // Return the cubes array in case it needs to be used outside this function
            return cubes;
        }

        // Create and group cubes
        const cubes = createAndGroupCubes();

        const rotate = (group, axis, angle) => {
            const newPositions = []; // Array to store new positions

            group.children.forEach(cube => {
                // Rotate the cube
                cube.rotateOnWorldAxis(axis, angle);

                // Calculate the new world position
                const newPosition = new THREE.Vector3();
                cube.getWorldPosition(newPosition);

                // Store the new position with reference to the cube's UUID
                newPositions.push({ uuid: cube.uuid, position: newPosition });
            });
            console.log('newPositions', newPositions)

            // Return the array of new positions
            return newPositions;
        };

        rotateRightUpRef.current = () => rotate(rightVerticalGroup, xAxis, -Math.PI / 2);
        rotateRightDownRef.current = () => rotate(rightVerticalGroup, xAxis, Math.PI / 2);
        rotateMiddleUpRef.current = () => rotate(middleVerticalGroup, xAxis, -Math.PI / 2);
        rotateMiddleDownRef.current = () => rotate(middleVerticalGroup, xAxis, Math.PI / 2);
        rotateLeftUpRef.current = () => rotate(leftVerticalGroup, xAxis, -Math.PI / 2);
        rotateLeftDownRef.current = () => rotate(leftVerticalGroup, xAxis, Math.PI / 2);
        rotateTopLeftRef.current = () => rotate(topHorizontalGroup, yAxis, -Math.PI / 2);
        rotateTopRightRef.current = () => rotate(topHorizontalGroup, yAxis, Math.PI / 2);

        // Function to handle mouse clicks
        const onMouseClick = (event) => {
            event.preventDefault();

            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(cubes);

            if (intersects.length > 0) {
                const intersectedCube = intersects[0].object;
                // console.log('Clicked on cube at position:', intersectedCube.position);
                // Additional logic to determine the cube's side can go here
            }
        };

        renderer.domElement.addEventListener('click', onMouseClick);


        const animate = function () {
            requestAnimationFrame(animate);
            controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            renderer.domElement.removeEventListener('click', onMouseClick);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div>
            <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />

            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',

            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button onClick={() => rotateRightUpRef.current()}>
                        Rotate Right Side Up
                    </button>
                    <button onClick={() => rotateRightDownRef.current()}>
                        Rotate Right Side Down
                    </button>
                    <button onClick={() => rotateMiddleUpRef.current()}>
                        Rotate Middle Side Up
                    </button>
                    <button onClick={() => rotateMiddleDownRef.current()}>
                        Rotate Middle Side Down
                    </button>
                    <button onClick={() => rotateLeftUpRef.current()}>
                        Rotate Left Side Up
                    </button>
                    <button onClick={() => rotateLeftDownRef.current()}>
                        Rotate Left Side Down
                    </button>
                    <button onClick={() => rotateTopLeftRef.current()}>
                        Rotate Top Left
                    </button>
                    <button onClick={() => rotateTopRightRef.current()}>
                        Rotate Top Right
                    </button>
                    {/* <button onClick={() => rotate(rightVerticalGroup, xAxis, Math.PI / 2)}>
                        Rotate Right Side Down
                    </button>
                    <button onClick={() => rotate(middleVerticalGroup, xAxis, -Math.PI / 2)}>
                        Rotate Middle Side Up
                    </button>
                    <button onClick={() => rotate(middleVerticalGroup, xAxis, Math.PI / 2)}>
                        Rotate Middle Side Down
                    </button>
                    <button onClick={() => rotate(leftVerticalGroup, xAxis, -Math.PI / 2)}>
                        Rotate Left Side Up
                    </button>
                    <button onClick={() => rotate(leftVerticalGroup, xAxis, Math.PI / 2)}>
                        Rotate Left Side Down
                    </button>
                    <button onClick={() => rotate(topHorizontalGroup, yAxis, -Math.PI / 2)}>
                        Rotate Top Left
                    </button>
                    <button onClick={() => rotate(topHorizontalGroup, yAxis, Math.PI / 2)}>
                        Rotate Top Right
                    </button> */}
                </div>

            </div>
            {/* TODO: LINK TO THE CORRECT REPOSITORY WHEN DEPLOYED */}
            <a style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '20px',
                fontFamily: 'Arial',

            }} rel='noreferrer' href={'https://github.com/jhoyos135'} target={'_blank'}>
                {'Github Repository'}
            </a>
        </div>
    )
        ;
}

export default RubiksContainer;
