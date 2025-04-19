import { NextRequest, NextResponse } from 'next/server';
import { mcp } from '@/lib/mcp';
import { supabase } from '@/lib/supabase';

/**
 * Endpoint central para el MCP (Módulo Central de Procesos)
 * 
 * Este endpoint recibe todas las peticiones de los usuarios,
 * las procesa a través del MCP y devuelve la respuesta.
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Obtener datos de la solicitud
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'El mensaje es requerido' },
        { status: 400 }
      );
    }

    // Verificar créditos del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, plan')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Error al obtener el perfil del usuario' },
        { status: 500 }
      );
    }

    // Verificar si el usuario tiene créditos suficientes
    if (profile.credits <= 0 && profile.plan === 'free') {
      return NextResponse.json(
        { error: 'No tienes suficientes créditos para realizar esta acción' },
        { status: 402 }
      );
    }

    // Procesar el mensaje a través del MCP
    const response = await mcp.processMessage(message, user.id);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Error al procesar el mensaje' },
        { status: 500 }
      );
    }

    // Descontar créditos si el plan es gratuito
    if (profile.plan === 'free') {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('user_id', user.id);
    }

    // Registrar la acción del usuario
    await supabase
      .from('user_actions')
      .insert([
        {
          user_id: user.id,
          action_type: 'message_sent',
          details: {
            message,
            clone: response.selectedClone,
            task_id: response.taskId
          },
          created_at: new Date().toISOString()
        }
      ]);

    // Devolver la respuesta
    return NextResponse.json({
      success: true,
      response: response.response,
      clone_type: response.selectedClone,
      task_id: response.taskId,
      credits_remaining: profile.plan === 'free' ? profile.credits - 1 : null
    });
  } catch (error) {
    console.error('Error in MCP endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
