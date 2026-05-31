alter table "public"."pets" add column "cor" text;

alter table "public"."pets" add column "descricao" text;

alter table "public"."pets" add column "raca" text;

alter table "public"."pets" add column "sexo" text;


  create policy "Usuários atualizam seus próprios pets"
  on "public"."pets"
  as permissive
  for update
  to public
using ((auth.uid() = owner_id));



  create policy "Usuários deletam seus próprios pets"
  on "public"."pets"
  as permissive
  for delete
  to public
using ((auth.uid() = owner_id));



  create policy "Usuários inserem seus próprios pets"
  on "public"."pets"
  as permissive
  for insert
  to public
with check ((auth.uid() = owner_id));



  create policy "Usuários veem seus próprios pets"
  on "public"."pets"
  as permissive
  for select
  to public
using ((auth.uid() = owner_id));



