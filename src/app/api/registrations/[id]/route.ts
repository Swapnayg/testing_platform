import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await req.json();

  // Your business logic here, like updating registration status
  console.log(`Updating registration ${id} with`, body);

  return NextResponse.json({ success: true, updatedId: id });
}
