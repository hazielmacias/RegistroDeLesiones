// ========================================
// SISTEMA DE LESIONADOS CON FIREBASE
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
    getFirestore,
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js';

// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================
const firebaseConfig = {
    apiKey: "AIzaSyCzRZgwZzvrBJUMoj6FFRMwcltOyfUxrzM",
    authDomain: "formulariolesionados-e7607.firebaseapp.com",
    projectId: "formulariolesionados-e7607",
    storageBucket: "formulariolesionados-e7607.firebasestorage.app",
    messagingSenderId: "473631286727",
    appId: "1:473631286727:web:e8823a66e0c7ab9c6965e2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = 'lesiones';

console.log('Firebase inicializado correctamente');

// Elementos del DOM
const form = document.getElementById('lesionadosForm');
const btnRegistrar = document.getElementById('btnRegistrar');

// ========================================
// FUNCIONES DE FIRESTORE
// ========================================

/**
 * Guarda una lesión en Firestore
 */
async function guardarLesion(lesion) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), lesion);
        console.log('Lesión registrada con ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error al guardar lesión:', error);
        console.error('Detalles del error:', error.message);
        throw error;
    }
}

/**
 * Verifica si un jugador tiene lesiones activas
 */
async function verificarLesionesActivas(celular) {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('celular', '==', celular),
            where('estado', '==', 'activa')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.size > 0;
    } catch (error) {
        console.error('Error al verificar lesiones:', error);
        return false;
    }
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Muestra/oculta la pantalla de carga
 */
function toggleLoadingScreen(mostrar) {
    const loadingScreen = document.getElementById('loadingScreen');
    console.log('Toggle loading screen:', mostrar);
    
    if (loadingScreen) {
        if (mostrar) {
            loadingScreen.style.display = 'flex';
            // Force reflow para que la animación funcione
            loadingScreen.offsetHeight;
            loadingScreen.classList.add('active');
            console.log('Pantalla de carga mostrada');
        } else {
            loadingScreen.classList.remove('active');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('Pantalla de carga ocultada');
            }, 300);
        }
    } else {
        console.error('No se encontró el elemento loadingScreen');
    }
}

/**
 * Muestra una notificación temporal
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${tipo}`;
    notif.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${tipo === 'success' 
                ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
            }
        </svg>
        <span>${mensaje}</span>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3500);
}

/**
 * Valida número de celular (10 dígitos)
 */
function validarCelular(celular) {
    return /^[0-9]{10}$/.test(celular);
}

/**
 * Valida todos los campos del formulario
 */
function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const categoria = document.getElementById('categoria').value;
    const tipoLesion = document.getElementById('tipoLesion').value;
    const zonaAfectada = document.getElementById('zonaAfectada').value.trim();
    const nivelDolor = document.getElementById('nivelDolor').value;
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!nombre || nombre.length < 3) {
        mostrarNotificacion('El nombre debe tener al menos 3 caracteres', 'error');
        return false;
    }

    if (!validarCelular(celular)) {
        mostrarNotificacion('El celular debe tener exactamente 10 dígitos', 'error');
        return false;
    }

    if (!categoria) {
        mostrarNotificacion('Debes seleccionar una categoría', 'error');
        return false;
    }

    if (!tipoLesion) {
        mostrarNotificacion('Debes seleccionar el tipo de lesión', 'error');
        return false;
    }

    if (!zonaAfectada || zonaAfectada.length < 3) {
        mostrarNotificacion('Debes especificar la zona afectada (mínimo 3 caracteres)', 'error');
        return false;
    }

    if (!nivelDolor) {
        mostrarNotificacion('Debes seleccionar el nivel de dolor', 'error');
        return false;
    }

    if (!descripcion || descripcion.length < 10) {
        mostrarNotificacion('La descripción debe tener al menos 10 caracteres', 'error');
        return false;
    }

    return true;
}

// ========================================
// REGISTRO DE LESIÓN
// ========================================

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Formulario enviado');
    
    // Validar formulario
    if (!validarFormulario()) {
        return;
    }
    
    // Mostrar pantalla de carga
    toggleLoadingScreen(true);
    const tiempoInicio = Date.now();
    
    try {
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const categoria = document.getElementById('categoria').value;
        const tipoLesion = document.getElementById('tipoLesion').value;
        const zonaAfectada = document.getElementById('zonaAfectada').value.trim();
        const nivelDolor = parseInt(document.getElementById('nivelDolor').value);
        const descripcion = document.getElementById('descripcion').value.trim();

        // Crear objeto de lesión
        const lesion = {
            // Información del jugador
            nombre: nombre,
            celular: celular,
            categoria: categoria,
            
            // Información de la lesión
            tipoLesion: tipoLesion,
            zonaAfectada: zonaAfectada,
            nivelDolor: nivelDolor,
            nivelDolorTexto: `${nivelDolor}/10`,
            descripcion: descripcion,
            
            // Datos de sistema
            timestamp: Timestamp.now(),
            fechaRegistro: new Date().toISOString(),
            estado: 'activa',
            
            // Campos para tracking futuro
            fechaRecuperacion: null,
            tratamiento: "",
            notas: ""
        };
        
        console.log('Lesión a guardar:', lesion);
        
        // Guardar en Firestore
        const docId = await guardarLesion(lesion);
        console.log('Documento guardado con ID:', docId);
        
        // Esperar mínimo 2 segundos para mostrar la pantalla de carga
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        const tiempoRestante = Math.max(0, 2000 - tiempoTranscurrido);
        
        if (tiempoRestante > 0) {
            console.log(`⏳ Esperando ${tiempoRestante}ms...`);
            await new Promise(resolve => setTimeout(resolve, tiempoRestante));
        }
        
        // Ocultar pantalla de carga
        toggleLoadingScreen(false);
        
        // Pequeño delay para suavizar la transición
        setTimeout(() => {
            // Mostrar notificación de éxito
            mostrarNotificacion('Lesión registrada correctamente. ¡Pronta recuperación!');
            
            // Limpiar formulario
            form.reset();
            console.log('Formulario limpiado');
        }, 200);
        
    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
        
        // Esperar mínimo 2 segundos incluso en caso de error
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        const tiempoRestante = Math.max(0, 2000 - tiempoTranscurrido);
        
        if (tiempoRestante > 0) {
            await new Promise(resolve => setTimeout(resolve, tiempoRestante));
        }
        
        toggleLoadingScreen(false);
        mostrarNotificacion('Error al registrar lesión. Intenta de nuevo.', 'error');
    }
});

// ========================================
// VERIFICACIÓN DE CONEXIÓN
// ========================================

/**
 * Verifica la conectividad con Firebase
 */
async function verificarConexion() {
    try {
        console.log('🔍 Verificando conexión a Firebase...');
        const q = query(collection(db, COLLECTION_NAME));
        await getDocs(q);
        console.log('✅ Conexión a Firebase establecida correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a Firebase:', error);
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        mostrarNotificacion('Error de conexión. Verifica tu internet.', 'error');
        return false;
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando sistema de lesionados...');
    console.log('📍 DOM cargado');
    
    // Verificar que los elementos existan
    if (!form) {
        console.error('❌ No se encontró el formulario');
        return;
    }
    
    if (!btnRegistrar) {
        console.error('❌ No se encontró el botón de registro');
        return;
    }
    
    try {
        // Verificar conexión
        const conectado = await verificarConexion();
        
        if (conectado) {
            console.log('✅ Sistema de lesionados inicializado correctamente');
        }
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        mostrarNotificacion('Error al inicializar el sistema', 'error');
    }
});