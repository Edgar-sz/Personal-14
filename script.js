// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

// 🎯 Fecha de inicio del amor: 14 de Febrero 2024
const LOVE_START_DATE = new Date(2024, 1, 14, 0, 0, 0); // 14 de Febrero 2024

// Mensaje romántico para Fabiola
const ROMANTIC_MESSAGE = {
    title: "Para mi piratilla de siete mares, Fabiola ❤️🌊:",
    message: `Un día como hoy, hablando de libros, de la vida y de mil cosas después del cine, me di cuenta de que me había enamorado de ti… aunque, siendo sincero, creo que ya lo estaba desde mucho antes.

Hoy celebramos un año más de amor, risas y sueños compartidos. Gracias por ser mi hogar, mi paz y mi felicidad.`,
    counterLabel: "Mi amor por ti comenzó hace..."
};

// Configuración de colores para los corazones
const HEART_COLORS = [
    '#e74c3c', // rojo
    '#c0392b', // rojo oscuro
    '#ec7063', // rosa
    '#f1948a', // rosa claro
];

// Variables globales
let canvas, ctx;
let hearts = [];
let fallingHearts = [];
let animationFrame;
let treeGrown = false;
let canvasWidth, canvasHeight;
let trunkImage = new Image();
let trunkImageLoaded = false;
let trunkSlideProgress = 0;
let redBall = null; // Bola roja que cae
let treeOffsetX = 0; // Desplazamiento del árbol hacia la derecha
let photoImage = new Image(); // 🎯 NUEVO: Imagen de la foto
let photoImageLoaded = false;
let breathePhase = 0; // 🎯 NUEVO: Para efecto de respiración

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('treeCanvas');
    ctx = canvas.getContext('2d');
    
    // Cargar imagen del tronco
    trunkImage.src = 'img/tronco.png';
    trunkImage.onload = () => {
        trunkImageLoaded = true;
    };
    trunkImage.onerror = () => {
        console.warn('No se pudo cargar la imagen del tronco, se usará el tronco dibujado');
        trunkImageLoaded = false;
    };
    
    // 🎯 NUEVO: Cargar imagen de la foto (intenta .jpg primero, luego .jpeg)
    photoImage.src = 'img/foto.jpg';
    photoImage.onload = () => {
        photoImageLoaded = true;
        console.log('✅ Foto cargada correctamente');
    };
    photoImage.onerror = () => {
        // Si no encuentra .jpg, intenta con .jpeg
        console.warn('⚠️ No se encontró foto.jpg, intentando con foto.jpeg...');
        photoImage.src = 'img/foto.jpeg';
        photoImage.onerror = () => {
            console.warn('⚠️ No se pudo cargar la foto en ningún formato');
            photoImageLoaded = false;
        };
    };
    
    // Configurar el canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event listener para el corazón inicial
    const startHeart = document.getElementById('startHeart');
    startHeart.addEventListener('click', startAnimation);
});

// Ajustar tamaño del canvas
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Redibujar si el árbol ya está crecido
    if (treeGrown) {
        drawAllHearts();
    }
}

// ============================================
// INICIO DE LA ANIMACIÓN
// ============================================
function startAnimation() {
    // Crear la bola roja que cae desde el centro
    redBall = {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        targetY: canvasHeight,
        size: 15,
        falling: true
    };
    
    // Ocultar pantalla inicial
    const initialScreen = document.getElementById('initialScreen');
    initialScreen.classList.add('fade-out');
    
    setTimeout(() => {
        initialScreen.style.display = 'none';
        animateRedBall();
    }, 500);
}

// ============================================
// ANIMACIÓN DE LA BOLA ROJA CAYENDO
// ============================================
function animateRedBall() {
    const gravity = 0.5;
    let velocityY = 0;
    
    function fall() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Física de caída
        velocityY += gravity;
        redBall.y += velocityY;
        
        // Dibujar la bola roja
        ctx.beginPath();
        ctx.arc(redBall.x, redBall.y, redBall.size, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        
        // Cuando llega al suelo, iniciar el árbol
        if (redBall.y >= canvasHeight - redBall.size) {
            redBall.falling = false;
            redBall.y = canvasHeight;
            growTree();
            return;
        }
        
        requestAnimationFrame(fall);
    }
    
    fall();
}

// ============================================
// CRECIMIENTO DEL ÁRBOL
// ============================================
function growTree() {
    // El árbol empieza en el centro donde cayó la bola
    const trunkX = canvasWidth / 2;
    const trunkY = canvasHeight;
    const trunkHeight = canvasHeight * 1; // AÚN MÁS GRANDE - 70% de la página
    
    // 🎯 Ajustar aquí para mover los corazones más ABAJO en el eje Y
    const treeTop = trunkY - trunkHeight + 100; // +100 mueve TODO más abajo
    // Aumenta el número para mover MÁS abajo (ej: +150, +200)
    // Disminuye el número para mover menos abajo (ej: +50, +0)
    
    generateTreeStructure(trunkX, treeTop);
    
    // Animar el crecimiento de los corazones
    animateTreeGrowth(trunkX, trunkY, trunkHeight);
}

// Dibujar el tronco del árbol con imagen manteniendo proporciones originales
function drawTrunk(x, y, height, slideProgress = 1) {
    if (trunkImageLoaded) {
        // Usar las dimensiones originales de la imagen
        const imgWidth = trunkImage.width;
        const imgHeight = trunkImage.height;
        
        // Escalar proporcionalmente para que quepa en la altura deseada
        const scale = height / imgHeight;
        const displayWidth = imgWidth * scale;
        const displayHeight = height * slideProgress;
        
        ctx.save();
        
        // Crear un clip para el efecto de barrido desde abajo
        ctx.beginPath();
        ctx.rect(
            x - displayWidth / 2, 
            y - displayHeight, 
            displayWidth, 
            displayHeight
        );
        ctx.clip();
        
        // Dibujar la imagen completa manteniendo proporciones
        ctx.drawImage(
            trunkImage,
            x - displayWidth / 2,
            y - height,
            displayWidth,
            height
        );
        
        ctx.restore();
    } else {
        // Fallback: dibujar tronco con código
        const trunkWidth = 60;
        const displayHeight = height * slideProgress;
        
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(x - trunkWidth / 2, y - displayHeight, trunkWidth, displayHeight);
        
        // Añadir textura al tronco
        ctx.strokeStyle = '#6b5436';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const textureY1 = y - displayHeight * Math.random();
            const textureY2 = y - displayHeight * Math.random();
            if (textureY1 > y - displayHeight && textureY2 > y - displayHeight) {
                ctx.beginPath();
                ctx.moveTo(x - trunkWidth / 2 + Math.random() * trunkWidth, textureY1);
                ctx.lineTo(x - trunkWidth / 2 + Math.random() * trunkWidth, textureY2);
                ctx.stroke();
            }
        }
    }
}

// Generar estructura de corazones del árbol en forma de corazón
function generateTreeStructure(centerX, centerY) {
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 0.8 : 1; // Más grande
    const heartCount = isMobile ? 500 : 2000; // MUCHOS MÁS CORAZONES
    
    // Generar corazones en forma de corazón grande con múltiples capas
    for (let i = 0; i < heartCount; i++) {
        const t = (i / heartCount) * Math.PI * 2;
        
        // Ecuación paramétrica de un corazón
        const x = 20 * Math.pow(Math.sin(t), 3);
        const y = -(16 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // Añadir más variación aleatoria para llenar completamente
        const randomRadius = Math.random() * 25; // Más área cubierta
        const randomAngle = Math.random() * Math.PI * 2;
        
        hearts.push({
            x: centerX + (x + Math.cos(randomAngle) * randomRadius) * scale * 5,
            y: centerY + (y + Math.sin(randomAngle) * randomRadius) * scale * 5,
            size: 10 + Math.random() * 30, // Variedad de tamaños
            baseSize: 10 + Math.random() * 30, // 🎯 NUEVO: Tamaño base para respiración
            color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
            rotation: Math.random() * Math.PI * 2,
            opacity: 0,
            targetOpacity: 0.75 + Math.random() * 0.25,
            growthDelay: i * 0.2, // MUCHO MÁS RÁPIDO (antes 0.8)
            grown: false,
            breatheOffset: Math.random() * Math.PI * 2 // 🎯 NUEVO: Offset aleatorio para respiración
        });
    }
}

// Animar el crecimiento progresivo y deslizamiento a la derecha
function animateTreeGrowth(initialTrunkX, trunkY, trunkHeight) {
    let frame = 0;
    const trunkSlideFrames = 30; // Más rápido
    const growthFrames = 80; // MUCHO MÁS RÁPIDO (antes 120)
    const slideToRightFrames = 120; // MÁS SUAVE - más frames para el deslizamiento
    let startSliding = false;
    
    const isMobile = window.innerWidth <= 768;
    const finalTrunkX = isMobile ? canvasWidth * 0.65 : canvasWidth * 0.7;
    
    function grow() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Calcular progreso del tronco (0 a 1)
        trunkSlideProgress = Math.min(frame / trunkSlideFrames, 1);
        
        // Calcular desplazamiento hacia la derecha con easing más suave
        if (startSliding) {
            const slideProgress = Math.min((frame - growthFrames) / slideToRightFrames, 1);
            // Función de ease-in-out para movimiento más suave
            const easeProgress = slideProgress < 0.5
                ? 4 * slideProgress * slideProgress * slideProgress
                : 1 - Math.pow(-2 * slideProgress + 2, 3) / 2;
            treeOffsetX = (finalTrunkX - initialTrunkX) * easeProgress;
        }
        
        const currentTrunkX = initialTrunkX + treeOffsetX;
        
        // Redibujar tronco con efecto de barrido
        drawTrunk(currentTrunkX, trunkY, trunkHeight, trunkSlideProgress);
        
        // 🎯 NUEVO: Incrementar fase de respiración
        breathePhase += 0.02;
        
        // Actualizar opacidad de los corazones SUPER RÁPIDO
        let allGrown = true;
        hearts.forEach(heart => {
            if (frame >= heart.growthDelay) {
                if (heart.opacity < heart.targetOpacity) {
                    heart.opacity += 0.1; // SUPER RÁPIDO (antes 0.05)
                    allGrown = false;
                } else {
                    heart.grown = true;
                }
            } else {
                allGrown = false;
            }
            
            if (heart.opacity > 0) {
                // 🎯 NUEVO: Aplicar efecto de respiración
                const breathe = Math.sin(breathePhase + heart.breatheOffset) * 0.05 + 1;
                const animatedSize = heart.baseSize * breathe;
                
                drawHeart(
                    heart.x + treeOffsetX, 
                    heart.y, 
                    animatedSize, 
                    heart.color, 
                    heart.opacity, 
                    heart.rotation
                );
            }
        });
        
        frame++;
        
        // Cuando todos los corazones crecieron, empezar a deslizar
        if (allGrown && !startSliding && frame >= growthFrames) {
            startSliding = true;
            // Mostrar texto inmediatamente cuando empieza a deslizar
            showRomanticText();
        }
        
        // Terminar cuando el deslizamiento termine
        if (startSliding && treeOffsetX >= (finalTrunkX - initialTrunkX)) {
            treeGrown = true;
            // Actualizar posiciones finales de los corazones
            hearts.forEach(heart => {
                heart.x += treeOffsetX;
            });
            treeOffsetX = finalTrunkX - initialTrunkX;
            startFallingHearts(finalTrunkX, trunkY, trunkHeight);
            startLoveCounter();
        } else {
            requestAnimationFrame(grow);
        }
    }
    
    grow();
}

// Dibujar todos los corazones (para resize)
function drawAllHearts() {
    if (!treeGrown) return;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const isMobile = window.innerWidth <= 768;
    const trunkX = isMobile ? canvasWidth * 0.65 : canvasWidth * 0.7;
    const trunkHeight = canvasHeight * 0.7; // 70% de la página
    drawTrunk(trunkX, canvasHeight, trunkHeight, 1);
    
    hearts.forEach(heart => {
        if (heart.grown) {
            drawHeart(heart.x, heart.y, heart.size, heart.color, heart.opacity, heart.rotation);
        }
    });
}

// ============================================
// EFECTO DE HOJAS CAYENDO
// ============================================
function startFallingHearts(trunkX, trunkY, trunkHeight) {
    // Generar corazones que caen hacia la IZQUIERDA (donde está el texto) con efecto de viento
    setInterval(() => {
        if (fallingHearts.length < 25) { // Más corazones cayendo
            const randomHeart = hearts[Math.floor(Math.random() * hearts.length)];
            fallingHearts.push({
                x: randomHeart.x,
                y: randomHeart.y,
                size: randomHeart.size * 0.8,
                color: randomHeart.color,
                opacity: randomHeart.targetOpacity,
                rotation: Math.random() * Math.PI * 2,
                velocityY: 0.8 + Math.random() * 0.8, // Caen más rápido
                velocityX: -1.2 - Math.random() * 1.0, // MÁS FUERTE hacia la izquierda (efecto viento)
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                windWave: Math.random() * Math.PI * 2 // Para oscilación tipo viento
            });
        }
    }, 400); // Más frecuente
    
    animateFallingHearts(trunkX, trunkY, trunkHeight);
}

function animateFallingHearts(trunkX, trunkY, trunkHeight) {
    function fall() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Redibujar tronco
        drawTrunk(trunkX, trunkY, trunkHeight, 1);
        
        // 🎯 NUEVO: Incrementar fase de respiración
        breathePhase += 0.02;
        
        // Dibujar corazones del árbol con efecto respiración
        hearts.forEach(heart => {
            if (heart.grown) {
                // 🎯 NUEVO: Aplicar efecto de respiración
                const breathe = Math.sin(breathePhase + heart.breatheOffset) * 0.05 + 1;
                const animatedSize = heart.baseSize * breathe;
                drawHeart(heart.x, heart.y, animatedSize, heart.color, heart.opacity, heart.rotation);
            }
        });
        
        // Actualizar y dibujar corazones cayendo con efecto de viento
        fallingHearts = fallingHearts.filter(heart => {
            heart.y += heart.velocityY;
            heart.x += heart.velocityX;
            heart.rotation += heart.rotationSpeed;
            heart.opacity -= 0.003; // Más lento para que lleguen hasta el texto
            
            // Efecto de viento - oscilación horizontal
            heart.windWave += 0.08;
            heart.x += Math.sin(heart.windWave) * 0.3;
            
            // El viento empuja más hacia la izquierda
            heart.velocityX -= 0.01;
            
            // Mantener corazones visibles por más tiempo para que lleguen a las letras
            if (heart.opacity > 0 && heart.y < canvasHeight + 50 && heart.x > -100) {
                drawHeart(heart.x, heart.y, heart.size, heart.color, heart.opacity, heart.rotation);
                return true;
            }
            return false;
        });
        
        // 🎯 NUEVO: Dibujar la foto con efecto respiración
        if (photoImageLoaded) {
            const basePhotoSize = 200; // 🎯 MUCHO MÁS GRANDE (era 100)
            const photoBreath = Math.sin(breathePhase * 0.8) * 0.08 + 1;
            const photoSize = basePhotoSize * photoBreath;
            const photoX = trunkX;
            const photoY = canvasHeight * 0.25;
            
            ctx.save();
            
            // Hacer la foto circular (clip)
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            
            // 🎯 Calcular dimensiones para efecto "cover" (llenar el círculo sin distorsión)
            const imgRatio = photoImage.width / photoImage.height;
            const circleRatio = 1; // El círculo siempre es 1:1
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgRatio > circleRatio) {
                // Imagen más ancha: ajustar por altura
                drawHeight = photoSize;
                drawWidth = drawHeight * imgRatio;
            } else {
                // Imagen más alta: ajustar por ancho
                drawWidth = photoSize;
                drawHeight = drawWidth / imgRatio;
            }
            
            // Centrar la imagen
            offsetX = photoX - drawWidth / 2;
            offsetY = photoY - drawHeight / 2;
            
            // Dibujar la foto sin distorsión (cover)
            ctx.drawImage(
                photoImage,
                offsetX,
                offsetY,
                drawWidth,
                drawHeight
            );
            ctx.restore();
            
            // Borde blanco con respiración
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5; // Borde más grueso para foto más grande
            ctx.stroke();
        }
        
        animationFrame = requestAnimationFrame(fall);
    }
    
    fall();
}

// ============================================
// DIBUJAR CORAZÓN
// ============================================
function drawHeart(x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Forma del corazón
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    
    // Curva izquierda superior
    ctx.bezierCurveTo(
        0, 0,
        -size / 2, 0,
        -size / 2, topCurveHeight
    );
    
    // Curva izquierda inferior
    ctx.bezierCurveTo(
        -size / 2, (size + topCurveHeight) / 2,
        0, (size + topCurveHeight) / 1.3,
        0, size
    );
    
    // Curva derecha inferior
    ctx.bezierCurveTo(
        0, (size + topCurveHeight) / 1.3,
        size / 2, (size + topCurveHeight) / 2,
        size / 2, topCurveHeight
    );
    
    // Curva derecha superior
    ctx.bezierCurveTo(
        size / 2, 0,
        0, 0,
        0, topCurveHeight
    );
    
    ctx.fill();
    ctx.restore();
}

// ============================================
// MOSTRAR TEXTO ROMÁNTICO CON EFECTO TYPEWRITER
// ============================================
function showRomanticText() {
    const romanticText = document.getElementById('romanticText');
    romanticText.classList.remove('hidden');
    romanticText.classList.add('visible');
    
    // Efecto de escritura para el título
    typeWriter('titleText', ROMANTIC_MESSAGE.title, 0, 50, () => {
        // Después del título, escribir el mensaje
        setTimeout(() => {
            typeWriter('messageText', ROMANTIC_MESSAGE.message, 0, 30, () => {
                // Después del mensaje, escribir el label del contador
                setTimeout(() => {
                    typeWriter('counterLabel', ROMANTIC_MESSAGE.counterLabel, 0, 40);
                }, 300);
            });
        }, 200);
    });
}

// Función de efecto typewriter
function typeWriter(elementId, text, index, speed, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(() => typeWriter(elementId, text, index, speed, callback), speed);
    } else if (callback) {
        callback();
    }
}

// ============================================
// CONTADOR DE AMOR
// ============================================
function startLoveCounter() {
    updateCounter();
    setInterval(updateCounter, 1000);
}

function updateCounter() {
    const now = new Date();
    const diff = now - LOVE_START_DATE;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}
