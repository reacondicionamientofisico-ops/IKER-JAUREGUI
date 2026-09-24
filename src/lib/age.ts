export function calcularEdad(fechaNacimiento: string | undefined): string {
  if (!fechaNacimiento) return "";
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const sinCumpleannosAun =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (sinCumpleannosAun) edad -= 1;

  return edad >= 0 ? String(edad) : "";
}
